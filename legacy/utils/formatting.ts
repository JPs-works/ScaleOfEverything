export const formatMeters = (meters: number): string => {
  if (meters === 0) return '0 m';

  // Handling extremely small numbers
  if (meters < 1e-24) {
    return `${(meters / 1e-35).toFixed(2)} ℓP (Planck Lengths)`;
  }
  
  // Nanometer scale
  if (meters < 1e-6) {
      if (meters < 1e-9) return `${(meters * 1e12).toPrecision(3)} pm`; // picometers
      return `${(meters * 1e9).toPrecision(3)} nm`; // nanometers
  }
  
  // Micrometer to centimeter
  if (meters < 1e-2) return `${(meters * 1e6).toPrecision(3)} μm`; // micrometers
  if (meters < 1) return `${(meters * 100).toPrecision(3)} cm`; // centimeters
  
  // Standard meters/km
  if (meters < 1000) return `${meters.toPrecision(3)} m`;
  if (meters < 1e9) return `${(meters / 1000).toPrecision(3)} km`;
  
  // Astronomical units
  const AU = 1.496e11;
  if (meters < 9.46e15 / 10) { // Less than 0.1 LY
      return `${(meters / AU).toPrecision(3)} AU`;
  }
  
  // Light years
  const LY = 9.46e15;
  return `${(meters / LY).toPrecision(3)} ly`;
};

export const formatScientific = (num: number): string => {
  return num.toExponential(2).replace('e+', ' × 10^').replace('e-', ' × 10^-');
}