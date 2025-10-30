import React, { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import proj4 from "proj4";

const C = { c: 299792458 };
const TILE_URL_TEMPLATE = import.meta.env.VITE_TILE_URL_TEMPLATE || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_FREQ = 100000; // 100 kHz

// ---- WebWorker (with marching squares contour extraction for accurate hyperbolas) ----
const workerSource = `
/* Worker: compute TDOA grid and extract contour lines by marching squares */
self.addEventListener('message', function(e) {
  const { cmd, data } = e.data;
  if (cmd !== 'computeGrid') return;
  const { gridBounds, nx, ny, masters, slaves, receivers, freq, levelsMeters } = data;
  const dx = (gridBounds.maxX - gridBounds.minX) / (nx - 1);
  const dy = (gridBounds.maxY - gridBounds.minY) / (ny - 1);
  const c = 299792458;

  // compute value grid for each (master,slave) pair: value = d_slave - d_master (meters)
  const tdoaMaps = [];

  // helper to read/write Float32Array
  function createGrid() { return new Float32Array(nx * ny); }

  for (let mi = 0; mi < masters.length; mi++) {
    for (let si = 0; si < slaves.length; si++) {
      const m = masters[mi];
      const s = slaves[si];
      const grid = createGrid();
      for (let j = 0; j < ny; j++) {
        const y = gridBounds.minY + j * dy;
        for (let i = 0; i < nx; i++) {
          const x = gridBounds.minX + i * dx;
          const idx = j * nx + i;
          const dM = Math.hypot(x - m.x, y - m.y);
          const dS = Math.hypot(x - s.x, y - s.y);
          grid[idx] = dS - dM;
        }
      }
      tdoaMaps.push({ masterIndex: mi, slaveIndex: si, nx, ny, gridBounds, data: grid.buffer });
    }
  }

  // Marching squares: builds polylines for each map & level
  function extractContours(gridFloat32, level) {
    // For each cell, check corners a,b,c,d (lower-left, lower-right, upper-right, upper-left)
    const segments = [];
    const get = (i, j) => gridFloat32[j * nx + i];
    const interp = (x1, y1, v1, x2, y2, v2) => {
      const t = (level - v1) / (v2 - v1 || 1e-12);
      return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
    };

    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const x0 = gridBounds.minX + i * ((gridBounds.maxX - gridBounds.minX)/(nx-1));
        const y0 = gridBounds.minY + j * ((gridBounds.maxY - gridBounds.minY)/(ny-1));
        const x1 = gridBounds.minX + (i+1) * ((gridBounds.maxX - gridBounds.minX)/(nx-1));
        const y1 = gridBounds.minY + (j+1) * ((gridBounds.maxY - gridBounds.minY)/(ny-1));

        const v00 = get(i, j);     // lower-left
        const v10 = get(i+1, j);   // lower-right
        const v11 = get(i+1, j+1); // upper-right
        const v01 = get(i, j+1);   // upper-left

        // case index (0-15)
        let idx = 0;
        if (v00 >= level) idx |= 1;
        if (v10 >= level) idx |= 2;
        if (v11 >= level) idx |= 4;
        if (v01 >= level) idx |= 8;

        // edge interpolation points for 12 possible edges; handle 16 cases
        // We'll only add segments for non-trivial cases (1..14)
        switch (idx) {
          case 0: case 15:
            break;
          case 1:
          case 14: {
            const p1 = interp(x0, y0, v00, x1, y0, v10); // bottom
            const p2 = interp(x0, y0, v00, x0, y1, v01); // left
            segments.push([p1, p2]); break;
          }
          case 2:
          case 13: {
            const p1 = interp(x1, y0, v10, x1, y1, v11); // right
            const p2 = interp(x0, y0, v00, x1, y0, v10); // bottom
            segments.push([p1, p2]); break;
          }
          case 3:
          case 12: {
            const p1 = interp(x1, y0, v10, x1, y1, v11); // right
            const p2 = interp(x0, y0, v00, x0, y1, v01); // left
            segments.push([p1, p2]); break;
          }
          case 4:
          case 11: {
            const p1 = interp(x1, y1, v11, x0, y1, v01); // top
            const p2 = interp(x1, y0, v10, x1, y1, v11); // right
            segments.push([p1, p2]); break;
          }
          case 5:
          case 10: {
            // ambiguous: two segments (use both)
            const a1 = interp(x0, y0, v00, x1, y0, v10); // bottom
            const a2 = interp(x1, y1, v11, x0, y1, v01); // top
            const b1 = interp(x0, y0, v00, x0, y1, v01); // left
            const b2 = interp(x1, y0, v10, x1, y1, v11); // right
            segments.push([a1, b1]);
            segments.push([a2, b2]);
            break;
          }
          case 6:
          case 9: {
            const p1 = interp(x0, y0, v00, x1, y0, v10); // bottom
            const p2 = interp(x1, y1, v11, x0, y1, v01); // top
            segments.push([p1, p2]); break;
          }
          case 7:
          case 8: {
            const p1 = interp(x0, y0, v00, x0, y1, v01); // left
            const p2 = interp(x1, y1, v11, x0, y1, v01); // top
            segments.push([p1, p2]); break;
          }
          default: break;
        }
      }
    }

    // Join segments into polylines
    const EPS = Math.max((gridBounds.maxX-gridBounds.minX)/(nx-1),(gridBounds.maxY-gridBounds.minY)/(ny-1)) * 0.5;
    const polylines = [];
    const used = new Array(segments.length).fill(false);

    function dist2(a,b){ const dx=a[0]-b[0], dy=a[1]-b[1]; return dx*dx+dy*dy; }

    for (let sidx = 0; sidx < segments.length; sidx++) {
      if (used[sidx]) continue;
      let seg = segments[sidx];
      used[sidx] = true;
      let poly = [seg[0], seg[1]];

      let extended = true;
      while (extended) {
        extended = false;
        // try extend at end
        for (let k = 0; k < segments.length; k++) {
          if (used[k]) continue;
          const [a,b] = segments[k];
          if (Math.sqrt(dist2(poly[poly.length-1], a)) < EPS) {
            poly.push(b); used[k]=true; extended=true; break;
          } else if (Math.sqrt(dist2(poly[poly.length-1], b)) < EPS) {
            poly.push(a); used[k]=true; extended=true; break;
          } else if (Math.sqrt(dist2(poly[0], a)) < EPS) {
            poly.unshift(b); used[k]=true; extended=true; break;
          } else if (Math.sqrt(dist2(poly[0], b)) < EPS) {
            poly.unshift(a); used[k]=true; extended=true; break;
          }
        }
      }
      polylines.push(poly);
    }

    return polylines;
  }

  // Build contours for requested levels across every tdoaMap
  const contours = [];
  const levels = levelsMeters && levelsMeters.length ? levelsMeters : (function(){
    // auto-levels: choose based on grid extents (± range / 12)
    const sampleGrid = new Float32Array(nx*ny);
    return [-5000,-3000,-1000,0,1000,3000,5000];
  })();

  // iterate maps
  tdoaMaps.forEach((m) => {
    const grid = new Float32Array(m.data);
    for (const level of levels) {
      const polylines = extractContours(grid, level);
      polylines.forEach((poly) => {
        // poly: array of [x,y] in meters (WebMercator)
        contours.push({
          masterIndex: m.masterIndex,
          slaveIndex: m.slaveIndex,
          levelMeters: level,
          levelSeconds: level / c,
          points: poly
        });
      });
    }
  });

  // include receivers positions (meters) so consumer can connect/verify intersections
  self.postMessage({ cmd: 'gridResult', tdoaMaps, contours, receivers }, tdoaMaps.map(t => t.data));
});
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

  const addMarker = useCallback((point, label, type) => {
    const el = document.createElement('div');
    el.className = `marker marker-${type}`;
    el.title = label;
    el.style.width = '18px'; el.style.height = '18px'; el.style.borderRadius = '50%';
    el.style.display='flex'; el.style.alignItems='center'; el.style.justifyContent='center';
    el.style.fontSize='10px'; el.style.color='white';
    if (type === 'master') el.style.background = '#1e90ff';
    if (type === 'slave') el.style.background = '#f59e0b';
    if (type === 'receiver') el.style.background = '#10b981';
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
    const m = { ...point, txDbm: 20, gri: 8330, label: `M${masters.length+1}` };
    setMasters(prev => [...prev, m]);
    addMarker(point, m.label, 'master');
  }, [masters.length, setMasters, addMarker]);

  const addSlave = useCallback((point) => {
    const s = { ...point, txDbm: 18, offsetSec: 0, label: `S${slaves.length+1}` };
    setSlaves(prev => [...prev, s]);
    addMarker(point, s.label, 'slave');
  }, [slaves.length, setSlaves, addMarker]);

  const addReceiver = useCallback((point) => {
    const r = { ...point, label: `R${receivers.length+1}` };
    setReceivers(prev => [...prev, r]);
    addMarker(point, r.label, 'receiver');
  }, [receivers.length, setReceivers, addMarker]);

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
      }
    });

    return ()=> {
      window.removeEventListener('keydown', keyHandler);
      if (mapRef.current) mapRef.current.remove();
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

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

  // UI render
  return (
    <div className="w-full h-full flex flex-col" style={{height: '820px'}}>
      <div className="p-3 bg-slate-50 border-b flex items-center gap-3">
        <h2 className="text-lg font-semibold">LORAN-C Offline Simulator</h2>
        <div className="flex gap-2 ml-4">
          <button className={`px-2 py-1 rounded ${mode==='add-master'? 'bg-sky-600 text-white':''}`} onClick={()=>setMode('add-master')}>Add Master (m)</button>
          <button className={`px-2 py-1 rounded ${mode==='add-slave'? 'bg-amber-500 text-white':''}`} onClick={()=>setMode('add-slave')}>Add Slave (s)</button>
          <button className={`px-2 py-1 rounded ${mode==='add-receiver'? 'bg-green-600 text-white':''}`} onClick={()=>setMode('add-receiver')}>Add Receiver (r)</button>
          <button className={`px-2 py-1 rounded ${mode==='pan'? 'bg-gray-400 text-white':''}`} onClick={()=>setMode('pan')}>Pan (p)</button>
        </div>

        <div className="ml-auto flex gap-2">
          <button onClick={()=>computeGrid(200,200)} className="px-3 py-1 rounded bg-indigo-600 text-white">Compute Grid (WebWorker)</button>
          <button onClick={simulatePulsesAtReceivers} className="px-3 py-1 rounded bg-emerald-600 text-white">Simulate Pulses</button>
          <button onClick={()=>estimateReceiverLocationFromTDOA(0)} className="px-3 py-1 rounded bg-yellow-500 text-black">Estimate Rx (TDOA)</button>
          <button onClick={exportScenario} className="px-3 py-1 rounded bg-amber-400">Export GeoJSON</button>
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
            <h4 className="font-medium">Stations ({masters.length} masters, {slaves.length} slaves)</h4>
            <div className="mt-2 text-xs space-y-1">
              {masters.map((m,i)=> <div key={i}>M{i+1}: {m.lat.toFixed(5)}, {m.lng.toFixed(5)} Tx={m.txDbm} dBm</div>)}
              {slaves.map((s,i)=> <div key={i}>S{i+1}: {s.lat.toFixed(5)}, {s.lng.toFixed(5)}</div>)}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium">Receivers ({receivers.length})</h4>
            <div className="mt-2 text-xs">
              {receivers.map((r)=> <div key={r.label}>{r.label}: {r.lat.toFixed(5)}, {r.lng.toFixed(5)}</div>)}
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
                  <div className="text-sm font-medium">{result.receiver}</div>
                  <div className="text-xs mt-1">
                    {result.arrivals.map((arrival, i) => (
                      <div key={i}>
                        {arrival.station} ({arrival.type}): {arrival.arrivalSec.toFixed(6)}s, {arrival.txDbm}dBm
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
                          <div className="text-xs">{arrival.station} ({arrival.type})</div>
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
