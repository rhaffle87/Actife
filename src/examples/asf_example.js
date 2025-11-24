// Example ASF map function for a master station
// This function receives (lat,lng) in degrees and returns ASF in meters.
// Simple example: a sinusoidal ASF that varies with latitude and longitude.

function asfExample(lat, lng) {
  // small sinusoidal bias up to +/- 150 meters
  const meters = 100 * Math.sin((lat/90) * Math.PI) + 50 * Math.cos((lng/180) * Math.PI);
  return meters;
}

// Usage: paste the function body into the ASF textarea (remove the function wrapper),
// or adapt to return a single numeric value. Example body:
// return 100*Math.sin(lat/90*Math.PI) + 50*Math.cos(lng/180*Math.PI);

export default asfExample;
