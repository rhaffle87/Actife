import React, { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import proj4 from "proj4";

const C = { c: 299792458 };
const TILE_URL_TEMPLATE = import.meta.env.VITE_TILE_URL_TEMPLATE || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_FREQ = 100000; // 100 kHz

// ---- WebWorker (with marching squares contour extraction for accurate hyperbolas) ----
const workerSource = `
/* Improved Worker: compute TDOA grid + marching squares contours (optimized) */
(function(){
  const C = 299792458;

  // Edge indices: 0=bottom (between v00-v10), 1=right (v10-v11), 2=top (v11-v01), 3=left (v01-v00)
  const EDGE_PAIRS_BY_CASE = {
    1: [[0,3]],
    2: [[0,1]],
    3: [[1,3]],
    4: [[1,2]],
    5: [[0,1],[2,3]], // ambiguous
    6: [[0,2]],
    7: [[2,3]],
    8: [[2,3]],
    9: [[0,2]],
    10: [[0,3],[1,2]], // ambiguous
    11: [[1,2]],
    12: [[1,3]],
    13: [[0,1]],
    14: [[0,3]],
  };

  let cancelled = false;
  self.addEventListener('message', function(e){
    const data = e.data || {};
    if (data && data.cmd === 'cancel') { cancelled = true; return; }
    if (!data || data.cmd !== 'computeGrid') return;
    cancelled = false;

    try {
      const payload = data.data;
      const {
        gridBounds, nx, ny,
        masters = [], slaves = [], receivers = [],
        freq = 100000, levelsMeters
      } = payload || {};

      // Basic validation
      if (!gridBounds || typeof nx !== 'number' || typeof ny !== 'number') {
        self.postMessage({ cmd: 'error', message: 'invalid grid parameters' });
        return;
      }
      if (!Array.isArray(masters) || !Array.isArray(slaves)) {
        self.postMessage({ cmd: 'error', message: 'masters/slaves must be arrays' });
        return;
      }
      const dx = (gridBounds.maxX - gridBounds.minX) / (nx - 1);
      const dy = (gridBounds.maxY - gridBounds.minY) / (ny - 1);

      // Precompute x and y coordinates for the grid (avoid recomputing in loops)
      const xs = new Float64Array(nx);
      const ys = new Float64Array(ny);
      for (let i = 0; i < nx; i++) xs[i] = gridBounds.minX + i * dx;
      for (let j = 0; j < ny; j++) ys[j] = gridBounds.minY + j * dy;

      // Helper: interpolation between two points (x1,y1,v1) - (x2,y2,v2) at level
      function interp(x1,y1,v1,x2,y2,v2, level) {
        const denom = v2 - v1;
        const t = Math.abs(denom) < 1e-12 ? 0.5 : ((level - v1) / denom);
        return [ x1 + t * (x2 - x1), y1 + t * (y2 - y1) ];
      }

      // Compute TDOA grids (Float32) for each master/slave pair
      const tdoaMaps = [];
      for (let mi = 0; mi < masters.length; mi++) {
        if (cancelled) break;
        const m = masters[mi];
        for (let si = 0; si < slaves.length; si++) {
          if (cancelled) break;
          const s = slaves[si];
          const grid = new Float32Array(nx * ny);
          let idx = 0;
          for (let j = 0; j < ny; j++) {
            const y = ys[j];
            for (let i = 0; i < nx; i++, idx++) {
              const x = xs[i];
              const dM = Math.hypot(x - m.x, y - m.y);
              const dS = Math.hypot(x - s.x, y - s.y);
              grid[idx] = dS - dM;
            }
          }
          tdoaMaps.push({
            masterIndex: mi,
            slaveIndex: si,
            nx, ny,
            gridBounds,
            data: grid.buffer
          });
        }
      }

      if (cancelled) {
        self.postMessage({ cmd: 'cancelled' });
        return;
      }

      // Default levels if not provided
      const levels = (Array.isArray(levelsMeters) && levelsMeters.length) ?
        levelsMeters.slice() : [-5000, -3000, -1000, 0, 1000, 3000, 5000];

      // Marching squares contour extraction optimized
      function extractContoursFromFloat32(gridFloat32, nx_, ny_, bounds, levelsArr) {
        const contoursOut = [];
        const gridNx = nx_, gridNy = ny_;
        const cellDx = (bounds.maxX - bounds.minX) / (gridNx - 1);
        const cellDy = (bounds.maxY - bounds.minY) / (gridNy - 1);
        const eps = Math.max(cellDx, cellDy) * 0.5;
        const quant = eps * 0.5; // quantization tolerance for endpoint hashing

        // quick access
        const get = (i, j) => gridFloat32[j * gridNx + i];

        for (const level of levelsArr) {
          if (cancelled) break;
          // segments as flat arrays of 4 numbers [x1,y1,x2,y2]
          const segments = [];

          // iterate cells
          for (let j = 0; j < gridNy - 1; j++) {
            const y0 = bounds.minY + j * cellDy;
            const y1 = bounds.minY + (j + 1) * cellDy;
            for (let i = 0; i < gridNx - 1; i++) {
              const x0 = bounds.minX + i * cellDx;
              const x1 = bounds.minX + (i + 1) * cellDx;

              const v00 = get(i, j);     // lower-left
              const v10 = get(i+1, j);   // lower-right
              const v11 = get(i+1, j+1); // upper-right
              const v01 = get(i, j+1);   // upper-left

              let idxCase = 0;
              if (v00 >= level) idxCase |= 1;
              if (v10 >= level) idxCase |= 2;
              if (v11 >= level) idxCase |= 4;
              if (v01 >= level) idxCase |= 8;

              if (idxCase === 0 || idxCase === 15) continue;

              const edgePairs = EDGE_PAIRS_BY_CASE[idxCase];
              if (!edgePairs) continue;

              // For ambiguous cases (5,10) use center value to decide (classic disambiguation)
              let resolvedPairs = edgePairs;
              if ((idxCase === 5 || idxCase === 10) && edgePairs.length === 2) {
                const center = (v00 + v10 + v11 + v01) * 0.25;
                // if center >= level, connect diagonally one way, else the other
                if (center >= level) {
                  resolvedPairs = (idxCase === 5) ? [[0,1]] : [[0,3]];
                } else {
                  resolvedPairs = (idxCase === 5) ? [[2,3]] : [[1,2]];
                }
              }

              // compute intersection points for required edges
              // bottom edge between (x0,y0) v00 and (x1,y0) v10  => edge 0
              // right edge between (x1,y0) v10 and (x1,y1) v11   => edge 1
              // top edge between (x1,y1) v11 and (x0,y1) v01     => edge 2
              // left edge between (x0,y1) v01 and (x0,y0) v00    => edge 3
              const edgePoint = new Array(4);
              function computeEdgePoint(e) {
                if (edgePoint[e]) return edgePoint[e];
                switch (e) {
                  case 0: return edgePoint[0] = interp(x0,y0,v00,x1,y0,v10, level);
                  case 1: return edgePoint[1] = interp(x1,y0,v10,x1,y1,v11, level);
                  case 2: return edgePoint[2] = interp(x1,y1,v11,x0,y1,v01, level);
                  case 3: return edgePoint[3] = interp(x0,y1,v01,x0,y0,v00, level);
                }
              }

              for (const pair of resolvedPairs) {
                const pA = computeEdgePoint(pair[0]);
                const pB = computeEdgePoint(pair[1]);
                segments.push([pA[0], pA[1], pB[0], pB[1]]);
              }
            }
          } // end cells

          if (segments.length === 0) continue;

          // Build endpoint map to join segments quickly (quantize endpoints into string keys)
          const endpointMap = new Map(); // key -> array of segment indices and side (0=start,1=end)
          function keyFor(x, y) {
            const qx = Math.round(x / quant);
            const qy = Math.round(y / quant);
            return qx + ':' + qy;
          }

          for (let si = 0; si < segments.length; si++) {
            const s = segments[si];
            const k1 = keyFor(s[0], s[1]);
            const k2 = keyFor(s[2], s[3]);
            if (!endpointMap.has(k1)) endpointMap.set(k1, []);
            endpointMap.get(k1).push([si, 0]);
            if (!endpointMap.has(k2)) endpointMap.set(k2, []);
            endpointMap.get(k2).push([si, 1]);
          }

          const used = new Uint8Array(segments.length);
          const polylines = [];

          // Helper to get other endpoint of segment
          function otherPointOfSegment(segIdx, side) {
            const s = segments[segIdx];
            if (side === 0) return [s[2], s[3]]; // if we are at start, other is end
            return [s[0], s[1]];
          }

          // Iterate segments, start from endpoints with degree 1 first (open polylines), then close loops
          const degrees = new Map();
          for (const [k, arr] of endpointMap) degrees.set(k, arr.length);

          function walkFrom(segIdx, fromSide) {
            const poly = [];
            let curSeg = segIdx;
            let curSide = fromSide; // 0 means we're at segment start, 1 at segment end
            // push starting point (the point at curSide)
            const s = segments[curSeg];
            const startPt = curSide === 0 ? [s[0], s[1]] : [s[2], s[3]];
            poly.push(startPt);

            while (curSeg !== null && !used[curSeg]) {
              used[curSeg] = 1;
              const s2 = segments[curSeg];
              const nextPt = curSide === 0 ? [s2[2], s2[3]] : [s2[0], s2[1]];
              poly.push(nextPt);

              // find next segment connected to nextPt (excluding current segment)
              const k = keyFor(nextPt[0], nextPt[1]);
              const candidates = endpointMap.get(k) || [];
              let nextPair = null;
              for (const [si, side] of candidates) {
                if (si === curSeg) continue;
                if (!used[si]) { nextPair = [si, side]; break; }
              }
              if (!nextPair) {
                // no continuation
                curSeg = null;
                break;
              } else {
                curSeg = nextPair[0];
                // if nextPair.side === 0 the current endpoint matches that segment's start, so we arrived at side 0; to move forward we need to flip side
                curSide = nextPair[1];
                // arrival side indicates which endpoint matched; to move along that segment we should then traverse from that side.
                // continue loop
              }
            }
            return poly;
          }

          // First, walk from endpoints with degree 1 to form open polylines
          for (const [k, deg] of degrees) {
            if (deg !== 1) continue;
            const arr = endpointMap.get(k) || [];
            for (const [si, side] of arr) {
              if (used[si]) continue;
              const poly = walkFrom(si, side);
              if (poly.length > 1) polylines.push(poly);
            }
          }

          // Then walk any remaining segments (closed loops)
          for (let si = 0; si < segments.length; si++) {
            if (used[si]) continue;
            const poly = walkFrom(si, 0);
            if (poly.length > 1) polylines.push(poly);
          }

          // Save polylines as contour objects (points arrays)
          for (const poly of polylines) {
            // poly is array of [x,y] points
            contoursOut.push({ levelMeters: level, levelSeconds: level / C, points: poly });
          }
        } // end levels

        return contoursOut;
      }

      // Build contours across each tdoaMap
      const contours = [];
      for (const m of tdoaMaps) {
        if (cancelled) break;
        const grid = new Float32Array(m.data);
        const polyContours = extractContoursFromFloat32(grid, m.nx, m.ny, m.gridBounds, levels);
        // attach indices for consumer
        polyContours.forEach(pc => {
          contours.push({
            masterIndex: m.masterIndex,
            slaveIndex: m.slaveIndex,
            levelMeters: pc.levelMeters,
            levelSeconds: pc.levelSeconds,
            points: pc.points
          });
        });
      }

      if (cancelled) {
        self.postMessage({ cmd: 'cancelled' });
        return;
      }

      // Post result with transferable grid buffers to avoid copy
      const transferList = tdoaMaps.map(t => t.data);
      self.postMessage({ cmd: 'gridResult', tdoaMaps, contours, receivers }, transferList);

    } catch (err) {
      self.postMessage({ cmd: 'error', message: String(err), stack: err && err.stack });
    }
  });
})();  
`;


// createWorker helper
function createWorker() {
  const blob = new Blob([workerSource], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const w = new Worker(url);
  URL.revokeObjectURL(url);
  return w;
}

// haversine & solver (unchanged)
function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function solvePositionFromTDOA(pairs, initialLngLat) {
  const refLat = initialLngLat.lat;
  function latLngToXY(lat, lng) {
    const R = 6371000;
    const x = (lng * Math.PI / 180) * R * Math.cos(refLat * Math.PI / 180);
    const y = (lat * Math.PI / 180) * R;
    return { x, y };
  }
  let x0 = latLngToXY(initialLngLat.lat, initialLngLat.lng).x;
  let y0 = latLngToXY(initialLngLat.lat, initialLngLat.lng).y;
  const maxIter = 30;
  for (let iter=0; iter<maxIter; iter++){
    const J = [];
    const r = [];
    for (const p of pairs) {
      const mxy = latLngToXY(p.master.lat, p.master.lng);
      const sxy = latLngToXY(p.slave.lat, p.slave.lng);
      const dM = Math.hypot(x0 - mxy.x, y0 - mxy.y);
      const dS = Math.hypot(x0 - sxy.x, y0 - sxy.y);
      const modeledDelta = (dS - dM)/C.c;
      const ri = (p.tdoaSec - modeledDelta);
      const ddx = ( (x0 - sxy.x)/dS - (x0 - mxy.x)/dM ) / C.c;
      const ddy = ( (y0 - sxy.y)/dS - (y0 - mxy.y)/dM ) / C.c;
      J.push([ddx, ddy]);
      r.push(ri);
    }
    const JTJ = [[0,0],[0,0]];
    const JTr = [0,0];
    for (let i=0;i<J.length;i++){
      const [j1,j2] = J[i];
      JTJ[0][0] += j1*j1; JTJ[0][1] += j1*j2;
      JTJ[1][0] += j2*j1; JTJ[1][1] += j2*j2;
      JTr[0] += j1 * r[i]; JTr[1] += j2 * r[i];
    }
    const det = JTJ[0][0]*JTJ[1][1] - JTJ[0][1]*JTJ[1][0];
    if (Math.abs(det) < 1e-12) break;
    const inv = [[JTJ[1][1]/det, -JTJ[0][1]/det], [-JTJ[1][0]/det, JTJ[0][0]/det]];
    const dx = inv[0][0]*JTr[0] + inv[0][1]*JTr[1];
    const dy = inv[1][0]*JTr[0] + inv[1][1]*JTr[1];
    x0 += dx; y0 += dy;
    if (Math.hypot(dx,dy) < 1e-6) break;
  }
  const R = 6371000;
  const lat = (y0 / R) * 180 / Math.PI;
  const lng = (x0 / (R * Math.cos(refLat * Math.PI / 180))) * 180 / Math.PI;
  return { lat, lng };
}

export default function LoranOfflineSimulator({ tileUrlTemplate = TILE_URL_TEMPLATE }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mode, setMode] = useState('add-master');
  const modeRef = useRef(mode);
  const [masters, setMasters] = useState([]); // {lat,lng, txDbm, gRI, label}
  const [slaves, setSlaves] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const workerRef = useRef(null);
  const [gridStatus, setGridStatus] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const markers = useRef({});
  const masterCounter = useRef(0);
  const slaveCounter = useRef(0);
  const receiverCounter = useRef(0);

  // --- Marker creation ---
  const addMarker = useCallback((point, label, type) => {
    const el = document.createElement('div');
    el.className = `marker marker-${type}`;
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';

    const dot = document.createElement('div');
    dot.style.width = '22px';
    dot.style.height = '22px';
    dot.style.borderRadius = '50%';
    if (type === 'master') dot.style.background = '#1e90ff';
    if (type === 'slave') dot.style.background = '#f59e0b';
    if (type === 'receiver') dot.style.background = '#10b981';

    const text = document.createElement('div');
    text.innerText = label;
    text.style.fontSize = '12px';
    text.style.color = 'black';
    text.style.textShadow = '0 1px 2px rgba(0,0,0,0.6)';

    el.appendChild(dot);
    el.appendChild(text);

    const marker = new maplibregl.Marker({ element: el, draggable: true })
      .setLngLat([point.lng, point.lat])
      .addTo(mapRef.current);

    marker.on('dragend', ()=>{
      const lnglat = marker.getLngLat();
      if (type === 'master') setMasters(prev=> prev.map(p=> p.label===label ? {...p, lat: lnglat.lat, lng: lnglat.lng} : p));
      if (type === 'slave') setSlaves(prev=> prev.map(p=> p.label===label ? {...p, lat: lnglat.lat, lng: lnglat.lng} : p));
      if (type === 'receiver') setReceivers(prev=> prev.map(p=> p.label===label ? {...p, lat: lnglat.lat, lng: lnglat.lng} : p));
    });

    markers.current[label] = marker;
  }, [setMasters, setSlaves, setReceivers]);

  const addMaster = useCallback((point) => {
    masterCounter.current++;
    const m = { ...point, txDbm: 20, gri: 8330, label: `M${masterCounter.current}` };
    setMasters(prev => [...prev, m]);
    addMarker(point, m.label, 'master');
  }, [setMasters, addMarker]);

  const addSlave = useCallback((point) => {
    slaveCounter.current++;
    const s = { ...point, txDbm: 18, offsetSec: 0, label: `S${slaveCounter.current}` };
    setSlaves(prev => [...prev, s]);
    addMarker(point, s.label, 'slave');
  }, [setSlaves, addMarker]);

  const addReceiver = useCallback((point) => {
    receiverCounter.current++;
    const r = { ...point, label: `R${receiverCounter.current}` };
    setReceivers(prev => [...prev, r]);
    addMarker(point, r.label, 'receiver');
  }, [setReceivers, addMarker]);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(()=> {
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [tileUrlTemplate],
            tileSize: 256,
            attribution: 'Offline tiles',
          }
        },
        layers: [{ id: 'simple-tiles', type: 'raster', source: 'raster-tiles' }]
      },
      center: [106.816666, -6.200000],
      zoom: 5,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl());

    mapRef.current.on('load', () => {
      mapRef.current.on('click', (e) => {
        const lnglat = e.lngLat;
        if (modeRef.current === 'add-master') addMaster({ lat: lnglat.lat, lng: lnglat.lng });
        else if (modeRef.current === 'add-slave') addSlave({ lat: lnglat.lat, lng: lnglat.lng });
        else if (modeRef.current === 'add-receiver') addReceiver({ lat: lnglat.lat, lng: lnglat.lng });
      });
      // Draw baselines initially if stations exist
      drawBaselines();
    });

    const keyHandler = (ev) => {
      if (ev.key === 'm') setMode('add-master');
      if (ev.key === 's') setMode('add-slave');
      if (ev.key === 'r') setMode('add-receiver');
      if (ev.key === 'p') setMode('pan');
    };
    window.addEventListener('keydown', keyHandler);

    workerRef.current = createWorker();
    workerRef.current.addEventListener('message', (ev)=>{
      const { cmd, tdoaMaps, contours, receivers: rcvrs } = ev.data;
      if (cmd === 'gridResult') {
        const maps = tdoaMaps.map((m)=>({
          masterIndex: m.masterIndex, slaveIndex: m.slaveIndex, nx: m.nx, ny: m.ny, gridBounds: m.gridBounds, data: new Float32Array(m.data)
        }));
        setGridStatus({ computedAt: Date.now(), maps, contours, receivers: rcvrs });
        drawLOPs(contours);
        drawBaselines();
      }
    });

    return ()=> {
      window.removeEventListener('keydown', keyHandler);
      if (mapRef.current) mapRef.current.remove();
      if (workerRef.current) workerRef.current.terminate();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect to update baselines when masters or slaves change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      drawBaselines();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masters, slaves]);

  // ---- computeGrid: now sends explicit levels and uses worker marching squares ----
  function computeGrid(nx=300, ny=300) {
    if (masters.length === 0 || slaves.length === 0) return alert('Add at least one master and one slave');
    const all = [...masters, ...slaves, ...receivers];
    const lats = all.map(a=>a.lat), lngs = all.map(a=>a.lng);
    const bbox = [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
    const padX = (bbox[2]-bbox[0])*0.3; const padY = (bbox[3]-bbox[1])*0.3;
    const bboxP = [bbox[0]-padX, bbox[1]-padY, bbox[2]+padX, bbox[3]+padY];
    const bottomLeft = proj4('EPSG:4326','EPSG:3857',[bboxP[0], bboxP[1]]);
    const topRight = proj4('EPSG:4326','EPSG:3857',[bboxP[2], bboxP[3]]);
    const gridBounds = { minX: bottomLeft[0], minY: bottomLeft[1], maxX: topRight[0], maxY: topRight[1] };
    const mMeters = masters.map(m=>{ const xy = proj4('EPSG:4326','EPSG:3857',[m.lng,m.lat]); return { x: xy[0], y: xy[1], label: m.label }; });
    const sMeters = slaves.map(s=>{ const xy = proj4('EPSG:4326','EPSG:3857',[s.lng,s.lat]); return { x: xy[0], y: xy[1], label: s.label }; });
    const rMeters = receivers.map(r=>{ const xy = proj4('EPSG:4326','EPSG:3857',[r.lng,r.lat]); return { x: xy[0], y: xy[1], label: r.label }; });

    // automatic levels: compute typical inter-station distance and pick spread
    let maxDist = 0;
    for (let mi=0; mi<mMeters.length; mi++){
      for (let si=0; si<sMeters.length; si++){
        const d = Math.hypot(mMeters[mi].x - sMeters[si].x, mMeters[mi].y - sMeters[si].y);
        if (d > maxDist) maxDist = d;
      }
    }
    // levels in meters (difference dS - dM), choose around zero spanning ±maxDist/4
    const step = Math.max(200, maxDist / 16);
    const levelsMeters = [];
    for (let k = -8; k <= 8; k++) levelsMeters.push(k * step);

    setGridStatus({ status: 'computing', nx, ny });
    workerRef.current.postMessage({ cmd: 'computeGrid', data: { gridBounds, nx, ny, masters: mMeters, slaves: sMeters, receivers: rMeters, freq: DEFAULT_FREQ, levelsMeters } });
  }

  // drawLOPs: convert contours (meters) to GeoJSON lines and add to map
  function drawLOPs(contours) {
    if (!mapRef.current) return;
    if (mapRef.current.getLayer('lops')) mapRef.current.removeLayer('lops');
    if (mapRef.current.getSource('lops')) mapRef.current.removeSource('lops');

    const features = contours.map((contour, idx) => {
      // convert [x,y] (EPSG:3857 meters) -> [lng, lat]
      const coords = contour.points.map(([x,y]) => {
        const [lng, lat] = proj4('EPSG:3857', 'EPSG:4326', [x, y]);
        return [lng, lat];
      });
      return {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {
          id: `lop-${contour.masterIndex}-${contour.slaveIndex}-${idx}`,
          masterIndex: contour.masterIndex,
          slaveIndex: contour.slaveIndex,
          levelMeters: contour.levelMeters,
          levelSeconds: contour.levelSeconds,
        }
      };
    });

    const geojson = { type: 'FeatureCollection', features };
    mapRef.current.addSource('lops', { type: 'geojson', data: geojson });
    mapRef.current.addLayer({
      id: 'lops',
      type: 'line',
      source: 'lops',
      paint: { 'line-color': '#ff0044', 'line-width': 2, 'line-opacity': 0.9 }
    });
  }

  function drawBaselines() {
    if (!mapRef.current) return;

    // Remove old baseline layer if exists
    if (mapRef.current.getLayer('baselines')) mapRef.current.removeLayer('baselines');
    if (mapRef.current.getSource('baselines')) mapRef.current.removeSource('baselines');

    if (masters.length === 0 || slaves.length === 0) return;

    const features = [];

    masters.forEach((m, midx) => {
      const [lngM, latM] = [m.lng, m.lat];
      slaves.forEach((s, sidx) => {
        const [lngS, latS] = [s.lng, s.lat];

        // Calculate baseline extension
        // Extend the line beyond the slave station by a factor (e.g., 0.5 means extend by 50% of the baseline length)
        const extensionFactor = 0.5;
        const deltaLng = lngS - lngM;
        const deltaLat = latS - latM;
        const extendedLng = lngS + deltaLng * extensionFactor;
        const extendedLat = latS + deltaLat * extensionFactor;

        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [lngM, latM],
              [lngS, latS],
              [extendedLng, extendedLat],
            ],
          },
          properties: {
            id: `baseline-${midx}-${sidx}`,
            type: 'baseline',
            masterLabel: m.label,
            slaveLabel: s.label,
            masterIndex: midx,
            slaveIndex: sidx,
          },
        });
      });
    });

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    mapRef.current.addSource('baselines', { type: 'geojson', data: geojson });
    mapRef.current.addLayer({
      id: 'baselines',
      type: 'line',
      source: 'baselines',
      paint: {
        'line-color': '#888',
        'line-width': 2,
        'line-opacity': 0.5,
        'line-dasharray': [2, 2], // dashed
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    });
  }

  // Enriched exportScenario: includes projected coords, grid metadata, and LOP contours (if any)
  function exportScenario() {
    const features = [];
    const createdAt = new Date().toISOString();

    // stations: with both lat/lng and EPSG:3857 meters
    masters.forEach((m, i) => {
      const xy = proj4('EPSG:4326', 'EPSG:3857', [m.lng, m.lat]);
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
        properties: {
          role: 'master',
          id: `M${i+1}`,
          label: m.label,
          txDbm: m.txDbm,
          gri: m.gri,
          projected: { x: xy[0], y: xy[1] },
          createdAt
        }
      });
    });
    slaves.forEach((s, i) => {
      const xy = proj4('EPSG:4326', 'EPSG:3857', [s.lng, s.lat]);
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: {
          role: 'slave',
          id: `S${i+1}`,
          label: s.label,
          txDbm: s.txDbm,
          offsetSec: s.offsetSec || 0,
          projected: { x: xy[0], y: xy[1] },
          createdAt
        }
      });
    });
    receivers.forEach((r, i) => {
      const xy = proj4('EPSG:4326', 'EPSG:3857', [r.lng, r.lat]);
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
        properties: {
          role: 'receiver',
          id: `R${i+1}`,
          label: r.label,
          projected: { x: xy[0], y: xy[1] },
          createdAt
        }
      });
    });

    // If grid computed, attach grid metadata and LOP contours as features
    if (gridStatus && gridStatus.contours) {
      // grid metadata feature
      const gridMeta = {
        type: 'Feature',
        geometry: null,
        properties: {
          type: 'grid-metadata',
          computedAt: gridStatus.computedAt,
          maps: gridStatus.maps ? gridStatus.maps.map(m => ({ masterIndex: m.masterIndex, slaveIndex: m.slaveIndex, nx: m.nx, ny: m.ny })) : [],
        }
      };
      features.push(gridMeta);

      // LOP contours -> LineString features with detailed properties
      gridStatus.contours.forEach((contour, idx) => {
        if (!contour.points || contour.points.length < 2) return;
        const coords = contour.points.map(([x,y]) => proj4('EPSG:3857','EPSG:4326',[x,y]));
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {
            type: 'lop-contour',
            id: `lop-${contour.masterIndex}-${contour.slaveIndex}-${idx}`,
            masterIndex: contour.masterIndex,
            slaveIndex: contour.slaveIndex,
            levelMeters: contour.levelMeters,
            levelSeconds: contour.levelSeconds,
            createdAt
          }
        });
      });
    }

    const gj = { type: 'FeatureCollection', features, properties: { exportedAt: createdAt, freqHz: DEFAULT_FREQ } };
    const blob = new Blob([JSON.stringify(gj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'loran-scenario-enriched.geojson'; a.click(); URL.revokeObjectURL(url);
  }

  function simulatePulsesAtReceivers(){
    if (masters.length===0 || slaves.length===0 || receivers.length===0) return alert('Add masters, slaves, and receivers');
    const sampleRate = 1000000;
    const pulseDuration = 0.0001;
    const totalDuration = 0.01;
    const numSamples = Math.floor(totalDuration * sampleRate);
    const results = receivers.map((r)=>{
      const arrivals = [];
      masters.forEach((m)=> {
        arrivals.push({ station: m.label, type: 'master', arrivalSec: haversine(m, r)/C.c, txDbm: m.txDbm });
      });
      slaves.forEach((s)=> {
        arrivals.push({ station: s.label, type: 'slave', arrivalSec: haversine(s, r)/C.c, txDbm: s.txDbm || 18 });
      });
      arrivals.sort((a,b)=>a.arrivalSec - b.arrivalSec);
      const waveform = new Array(numSamples).fill(0);
      arrivals.forEach((arrival) => {
        const startSample = Math.floor(arrival.arrivalSec * sampleRate);
        const endSample = Math.floor((arrival.arrivalSec + pulseDuration) * sampleRate);
        const amplitude = Math.pow(10, arrival.txDbm / 20);
        for (let i = startSample; i < endSample && i < numSamples; i++) {
          const t = (i - startSample) / sampleRate;
          const pulseShape = 0.5 * (1 + Math.cos(Math.PI * t / pulseDuration));
          waveform[i] += amplitude * pulseShape;
        }
      });
      return { receiver: r.label, arrivals, waveform, sampleRate, totalDuration };
    });
    setSimulationResults(results);
    alert('Pulse simulation completed. Waveforms in sidebar.');
    if (gridStatus && gridStatus.contours) drawLOPs(gridStatus.contours);
  }

  function estimateReceiverLocationFromTDOA(receiverIndex=0){
    if (receivers.length===0) return;
    const ref = masters[0];
    const r = receivers[receiverIndex];
    const pairs = [];
    for (let si=0; si<slaves.length; si++){
      const s = slaves[si];
      const tM = haversine(ref, r)/C.c;
      const tS = haversine(s, r)/C.c;
      pairs.push({ master: ref, slave: s, tdoaSec: tS - tM });
    }
    const est = solvePositionFromTDOA(pairs, { lat: r.lat, lng: r.lng });
    alert(`Estimated position: ${est.lat.toFixed(6)}, ${est.lng.toFixed(6)} — Actual: ${r.lat.toFixed(6)}, ${r.lng.toFixed(6)}`);
  }

  function resetSimulation() {
    // Clear all stations
    setMasters([]);
    setSlaves([]);
    setReceivers([]);
    // Clear grid and simulation results
    setGridStatus(null);
    setSimulationResults(null);
    // Reset counters
    masterCounter.current = 0;
    slaveCounter.current = 0;
    receiverCounter.current = 0;
    // Remove all markers from map
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};
    // Remove layers and sources
    if (mapRef.current) {
      if (mapRef.current.getLayer('baselines')) mapRef.current.removeLayer('baselines');
      if (mapRef.current.getSource('baselines')) mapRef.current.removeSource('baselines');
      if (mapRef.current.getLayer('lops')) mapRef.current.removeLayer('lops');
      if (mapRef.current.getSource('lops')) mapRef.current.removeSource('lops');
    }
  }

  // UI render
  return (
    <div className="w-full h-full flex flex-col" style={{height: '820px'}}>
      <div className="p-3 bg-slate-50 border-b flex items-center gap-3">
        <h2 className="text-lg font-semibold">LORAN-C Offline Simulator</h2>
        <div className="flex gap-2 ml-4">
          <button className={`px-2 py-1 rounded transition-all duration-200 hover:scale-105 hover:shadow-md ${mode==='add-master'? 'bg-sky-600 text-white':''}`} onClick={()=>setMode('add-master')}>Add Master (m)</button>
          <button className={`px-2 py-1 rounded transition-all duration-200 hover:scale-105 hover:shadow-md ${mode==='add-slave'? 'bg-amber-500 text-white':''}`} onClick={()=>setMode('add-slave')}>Add Slave (s)</button>
          <button className={`px-2 py-1 rounded transition-all duration-200 hover:scale-105 hover:shadow-md ${mode==='add-receiver'? 'bg-green-600 text-white':''}`} onClick={()=>setMode('add-receiver')}>Add Receiver (r)</button>
          <button className={`px-2 py-1 rounded transition-all duration-200 hover:scale-105 hover:shadow-md ${mode==='pan'? 'bg-gray-400 text-white':''}`} onClick={()=>setMode('pan')}>Pan (p)</button>
        </div>

        <div className="ml-auto flex gap-2">
          <button onClick={()=>computeGrid(200,200)} className="px-3 py-1 rounded bg-indigo-600 text-white transition-all duration-200 hover:scale-105 hover:shadow-md">Compute Grid (WebWorker)</button>
          <button onClick={simulatePulsesAtReceivers} className="px-3 py-1 rounded bg-emerald-600 text-white transition-all duration-200 hover:scale-105 hover:shadow-md">Simulate Pulses</button>
          <button onClick={()=>estimateReceiverLocationFromTDOA(0)} className="px-3 py-1 rounded bg-yellow-500 text-black transition-all duration-200 hover:scale-105 hover:shadow-md">Estimate Rx (TDOA)</button>
          <button onClick={exportScenario} className="px-3 py-1 rounded bg-amber-400 transition-all duration-200 hover:scale-105 hover:shadow-md">Export GeoJSON</button>
          <button onClick={resetSimulation} className="px-3 py-1 rounded bg-red-500 text-white transition-all duration-200 hover:scale-105 hover:shadow-md">Reset Simulation</button>
        </div>
      </div>

      <div className="flex-1 flex gap-2">
        <div className="w-3/4 h-full" ref={mapContainer} />
        <aside className="w-1/4 p-3 bg-white border-l overflow-auto">
          <h3 className="font-semibold">Legend & Controls</h3>
          <div className="mt-2 text-sm">
            <div><strong>M</strong>: Master station (reference)</div>
            <div><strong>S</strong>: Slave / secondary station</div>
            <div><strong>R</strong>: Receiver / user device</div>
            <div className="mt-3">Freq: {DEFAULT_FREQ/1000} kHz</div>
            <div>Speed of light c = {C.c.toLocaleString()} m/s</div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium">How to Use LORAN-C Simulator</h4>
            <div className="mt-2 text-xs">
              <ol className="list-decimal ml-4 space-y-1">
                <li>Select mode (Add Master/Slave/Receiver) and click on map to place stations.</li>
                <li>Add at least one master and one slave to form baselines.</li>
                <li>Click "Compute Grid" to generate Lines of Position (LOPs) using WebWorker.</li>
                <li>Add receivers and simulate pulse arrivals with waveforms.</li>
                <li>Use TDOA estimation to locate receivers based on time differences.</li>
                <li>Export scenario as GeoJSON or reset simulation as needed.</li>
              </ol>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium">Stations ({masters.length} masters, {slaves.length} slaves)</h4>
            <div className="mt-2 text-xs space-y-1">
              {masters.map((m,i)=> <div key={i}>[M] {m.label}: {m.lat.toFixed(5)}, {m.lng.toFixed(5)} Tx={m.txDbm} dBm</div>)}
              {slaves.map((s,i)=> <div key={i}>[S] {s.label}: {s.lat.toFixed(5)}, {s.lng.toFixed(5)}</div>)}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium">Receivers ({receivers.length})</h4>
            <div className="mt-2 text-xs">
              {receivers.map((r)=> <div key={r.label}>[R] {r.label}: {r.lat.toFixed(5)}, {r.lng.toFixed(5)}</div>)}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium">Grid status</h4>
            <div className="text-xs mt-2">{gridStatus ? (gridStatus.status || 'ready') : 'not computed'}</div>
            {gridStatus && gridStatus.maps && <div className="text-xs mt-2">Maps computed: {gridStatus.maps.length}</div>}
          </div>

          {simulationResults && (
            <div className="mt-4">
              <h4 className="font-medium">Pulse Simulation Results</h4>
              {simulationResults.map((result, idx) => (
                <div key={idx} className="mt-2">
                  <div className="text-sm font-medium">[R] {result.receiver}</div>
                  <div className="text-xs mt-1">
                    {result.arrivals.map((arrival, i) => (
                      <div key={i}>
                        [{arrival.type.charAt(0).toUpperCase()}] {arrival.station}: {arrival.arrivalSec.toFixed(6)}s, {arrival.txDbm}dBm
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-medium">Waveforms:</div>
                    {result.arrivals.map((arrival, i) => {
                      // Generate individual pulse waveform for this arrival
                      const pulseSamples = 1000; // 1ms window for each pulse
                      const pulseWaveform = new Array(pulseSamples).fill(0);
                      const startSample = Math.floor((arrival.arrivalSec % 0.001) * 1000000); // relative to ms window
                      const endSample = Math.floor((arrival.arrivalSec % 0.001 + 0.0001) * 1000000);
                      const amplitude = Math.pow(10, arrival.txDbm / 20);

                      for (let j = startSample; j < endSample && j < pulseSamples; j++) {
                        const t = (j - startSample) / 1000000;
                        const pulseShape = 0.5 * (1 + Math.cos(Math.PI * t / 0.0001));
                        pulseWaveform[j] += amplitude * pulseShape;
                      }

                      const maxVal = Math.max(...pulseWaveform) || 1;
                      return (
                        <div key={i} className="mt-1">
                          <div className="text-xs">[{arrival.type.charAt(0).toUpperCase()}] {arrival.station}</div>
                          <svg width="100%" height="40" viewBox="0 0 1000 40" className="border">
                            <polyline
                              fill="none"
                              stroke={arrival.type === 'master' ? '#1e90ff' : '#f59e0b'}
                              strokeWidth="1"
                              points={pulseWaveform.map((val, j) => `${(j / pulseSamples) * 1000},${20 - (val / maxVal) * 20}`).join(' ')}
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-xs">
            <h4 className="font-medium">Next steps &amp; tips</h4>
            <ol className="list-decimal ml-4 mt-2">
              <li>Host local tiles (MBTiles to tileserver) and set VITE_TILE_URL_TEMPLATE to your server.</li>
              <li>For high-precision hyperbola contours, compute contours from the Float32 grids (marching squares) and draw as GeoJSON.</li>
              <li>Integrate ionospheric skywave windows and seasonal conductivity datasets to model long-range reception.</li>
              <li>To visualize in 3D, connect deck.gl or Three.js with elevation tiles — a placeholder WebGL layer is prepared.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
