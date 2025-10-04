/**
 * Meteoroid Impact Calculator Service
 * Provides calculations for orbital mechanics, impact probability, and crater size
 * These Calculation were implemented using AI assistance.
 */

const { addGeographicImpactData } = require('./calculate_lat_and_long');

// Physical Constants
const CONSTANTS = {
  G: 6.674e-11,                    // Gravitational constant (m³ kg⁻¹ s⁻²)
  M_SUN: 1.989e30,                 // Mass of the Sun (kg)
  AU: 1.496e11,                    // Astronomical Unit (m)
  EARTH_RADIUS: 6371000,           // Earth radius (m)
  GRAVITY: 9.8,                    // Earth gravity (m/s²)
  STONY_DENSITY: 3000,             // Stony asteroid density (kg/m³)
  IRON_DENSITY: 8000,              // Iron asteroid density (kg/m³)
  DEFAULT_DENSITY: 3000,           // Default density (kg/m³)
  CRATER_SCALING_CONSTANT: 0.2     // Empirical crater scaling constant
};

/**
 * Calculate the semi-major axis using the vis-viva equation
 * @param {number} velocity - Velocity in m/s
 * @param {number} distance - Distance from Sun in meters
 * @returns {number} Semi-major axis in meters
 */
function calculateSemiMajorAxis(velocity, distance) {
  const vSquared = velocity * velocity;
  const GM = CONSTANTS.G * CONSTANTS.M_SUN;
  
  const term = (2 / distance) - (vSquared / GM);
  const semiMajorAxis = 1 / term;
  
  return semiMajorAxis;
}

/**
 * Calculate orbital period using Kepler's Third Law
 * @param {number} semiMajorAxis - Semi-major axis in meters
 * @returns {number} Orbital period in seconds
 */
function calculateOrbitalPeriod(semiMajorAxis) {
  const GM = CONSTANTS.G * CONSTANTS.M_SUN;
  const a3 = Math.pow(semiMajorAxis, 3);
  
  const TSquared = (4 * Math.PI * Math.PI * a3) / GM;
  const period = Math.sqrt(TSquared);
  
  return period;
}

/**
 * Calculate the mass of the meteoroid
 * @param {number} diameter - Diameter in meters
 * @param {number} density - Density in kg/m³
 * @returns {number} Mass in kg
 */
function calculateMass(diameter, density = CONSTANTS.DEFAULT_DENSITY) {
  const radius = diameter / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const mass = density * volume;
  
  return mass;
}

/**
 * Calculate kinetic energy
 * @param {number} mass - Mass in kg
 * @param {number} velocity - Velocity in m/s
 * @returns {number} Kinetic energy in Joules
 */
function calculateKineticEnergy(mass, velocity) {
  return 0.5 * mass * velocity * velocity;
}

/**
 * Calculate estimated crater diameter
 * @param {number} kineticEnergy - Kinetic energy in Joules
 * @returns {number} Crater diameter in meters
 */
function calculateCraterDiameter(kineticEnergy) {
  const exponent = 1 / 3.4;
  const energyTerm = kineticEnergy / CONSTANTS.GRAVITY;
  const diameter = CONSTANTS.CRATER_SCALING_CONSTANT * Math.pow(energyTerm, exponent);
  
  return diameter;
}

/**
 * Estimate impact probability based on miss distance and diameter
 * This is a simplified model; real calculations use Monte Carlo simulations
 * @param {number} missDistance - Miss distance in km
 * @param {number} diameter - Object diameter in km
 * @returns {number} Impact probability (0-1)
 */
function estimateImpactProbability(missDistance, diameter) {
  // Simplified model: probability decreases with miss distance
  // Real calculations require orbital uncertainty analysis
  
  const earthRadius = CONSTANTS.EARTH_RADIUS / 1000; // Convert to km
  const criticalDistance = earthRadius + (diameter * 10); // Safety margin
  
  if (missDistance <= earthRadius) {
    return 1.0; // Direct impact
  } else if (missDistance <= criticalDistance) {
    // Exponential decay model
    const ratio = (missDistance - earthRadius) / (criticalDistance - earthRadius);
    return Math.exp(-5 * ratio);
  } else {
    // Very low probability for distant objects
    return 1e-6;
  }
}

/**
 * Process a single NEO object and calculate impact parameters
 * @param {object} neo - Near Earth Object data from NASA API
 * @returns {object} Processed NEO data with calculations
 */
function processNEO(neo) {
  try {
    // Extract basic information
    const neoData = {
      id: neo.id,
      name: neo.name,
      isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
      absoluteMagnitude: neo.absolute_magnitude_h,
      isSentryObject: neo.is_sentry_object || false
    };

    // Get diameter information (using meters)
    const diameterData = neo.estimated_diameter?.meters || {};
    const minDiameter = diameterData.estimated_diameter_min || 0;
    const maxDiameter = diameterData.estimated_diameter_max || 0;
    const avgDiameter = (minDiameter + maxDiameter) / 2;

    neoData.diameter = {
      min: minDiameter,
      max: maxDiameter,
      average: avgDiameter,
      unit: 'meters'
    };

    // Process close approach data
    if (neo.close_approach_data && neo.close_approach_data.length > 0) {
      const approaches = neo.close_approach_data.map(approach => {
        // Extract velocity (convert km/s to m/s)
        const velocityKmS = parseFloat(approach.relative_velocity?.kilometers_per_second || 0);
        const velocityMS = velocityKmS * 1000;

        // Extract miss distance
        const missDistanceKm = parseFloat(approach.miss_distance?.kilometers || 0);
        const missDistanceAU = parseFloat(approach.miss_distance?.astronomical || 0);
        const missDistanceLunar = parseFloat(approach.miss_distance?.lunar || 0);

        // Calculate mass (using average diameter and default density)
        const mass = calculateMass(avgDiameter, CONSTANTS.DEFAULT_DENSITY);

        // Calculate kinetic energy
        const kineticEnergy = calculateKineticEnergy(mass, velocityMS);

        // Calculate crater diameter
        const craterDiameter = calculateCraterDiameter(kineticEnergy);
        const craterRadius = craterDiameter / 2;

        // Estimate impact probability
        const impactProbability = estimateImpactProbability(missDistanceKm, avgDiameter / 1000);

        // Calculate next pass time (simplified - using miss distance and velocity)
        // For real calculation, we'd need full orbital elements
        const nextPassEstimate = calculateNextPassEstimate(approach.close_approach_date, missDistanceKm, velocityKmS);

        return {
          closeApproachDate: approach.close_approach_date,
          closeApproachDateFull: approach.close_approach_date_full,
          orbitingBody: approach.orbiting_body,
          velocity: {
            kilometersPerSecond: velocityKmS,
            kilometersPerHour: parseFloat(approach.relative_velocity?.kilometers_per_hour || 0),
            milesPerHour: parseFloat(approach.relative_velocity?.miles_per_hour || 0),
            metersPerSecond: velocityMS
          },
          missDistance: {
            astronomical: missDistanceAU,
            lunar: missDistanceLunar,
            kilometers: missDistanceKm,
            miles: parseFloat(approach.miss_distance?.miles || 0)
          },
          calculations: {
            mass: {
              value: mass,
              unit: 'kg'
            },
            kineticEnergy: {
              value: kineticEnergy,
              unit: 'Joules',
              megatons: kineticEnergy / 4.184e15 // Convert to megatons of TNT
            },
            estimatedCrater: {
              diameter: craterDiameter,
              radius: craterRadius,
              unit: 'meters'
            },
            impactProbability: {
              value: impactProbability,
              percentage: (impactProbability * 100).toFixed(8),
              riskLevel: getRiskLevel(impactProbability, neo.is_potentially_hazardous_asteroid)
            },
            nextPassEstimate: nextPassEstimate
          }
        };
      });

      neoData.closeApproaches = approaches;
      
      // Set the most recent or upcoming approach as primary
      neoData.primaryApproach = approaches[0];
    }

    // Add geographic impact data (latitude/longitude calculations)
    const neoWithGeoData = addGeographicImpactData(neoData);
    
    return neoWithGeoData;
  } catch (error) {
    console.error('Error processing NEO:', error);
    return {
      id: neo.id,
      name: neo.name,
      error: 'Failed to process NEO data',
      errorDetails: error.message
    };
  }
}

/**
 * Calculate estimated next pass time
 * @param {string} lastPassDate - Last close approach date
 * @param {number} missDistanceKm - Miss distance in km
 * @param {number} velocityKmS - Velocity in km/s
 * @returns {object} Next pass estimate
 */
function calculateNextPassEstimate(lastPassDate, missDistanceKm, velocityKmS) {
  // This is a very simplified estimate
  // Real calculation requires full orbital elements and perturbation analysis
  
  try {
    const lastPass = new Date(lastPassDate);
    
    // Estimate orbital period (very rough approximation)
    // Assuming average distance of 1 AU and using simplified Kepler's law
    const avgDistanceM = CONSTANTS.AU;
    const velocityMS = velocityKmS * 1000;
    
    // Calculate semi-major axis (rough estimate)
    const semiMajorAxis = calculateSemiMajorAxis(velocityMS, avgDistanceM);
    
    // Calculate orbital period
    const periodSeconds = calculateOrbitalPeriod(semiMajorAxis);
    const periodYears = periodSeconds / (365.25 * 24 * 3600);
    
    // Estimate next pass
    const nextPass = new Date(lastPass.getTime() + (periodSeconds * 1000));
    
    return {
      estimatedOrbitalPeriod: {
        seconds: periodSeconds,
        days: periodSeconds / 86400,
        years: periodYears
      },
      estimatedNextPass: nextPass.toISOString().split('T')[0],
      note: 'This is a simplified estimate. Actual orbital mechanics require precise tracking and perturbation analysis.',
      confidence: 'low'
    };
  } catch (error) {
    return {
      error: 'Unable to calculate next pass estimate',
      note: 'Requires more detailed orbital parameters'
    };
  }
}

/**
 * Determine risk level based on impact probability and hazard status
 * @param {number} probability - Impact probability (0-1)
 * @param {boolean} isPotentiallyHazardous - NASA hazard classification
 * @returns {string} Risk level
 */
function getRiskLevel(probability, isPotentiallyHazardous) {
  if (probability > 0.01) return 'CRITICAL';
  if (probability > 0.001) return 'HIGH';
  if (probability > 0.0001) return 'MODERATE';
  if (isPotentiallyHazardous) return 'LOW-HAZARDOUS';
  return 'MINIMAL';
}

/**
 * Process all NEOs from NASA feed data
 * @param {object} nasaFeedData - Raw NASA NEO feed data
 * @returns {object} Processed data with calculations
 */
function processNASAFeedData(nasaFeedData) {
  const result = {
    elementCount: nasaFeedData.element_count,
    links: nasaFeedData.links,
    processedDates: []
  };

  // Process each date's NEOs
  const nearEarthObjects = nasaFeedData.near_earth_objects || {};
  
  for (const [date, neos] of Object.entries(nearEarthObjects)) {
    const processedNEOs = neos.map(neo => processNEO(neo));
    
    result.processedDates.push({
      date: date,
      neoCount: neos.length,
      neos: processedNEOs
    });
  }

  // Add summary statistics
  result.summary = generateSummary(result.processedDates);

  return result;
}

/**
 * Generate summary statistics
 * @param {array} processedDates - Array of processed date objects
 * @returns {object} Summary statistics
 */
function generateSummary(processedDates) {
  let totalNEOs = 0;
  let hazardousCount = 0;
  let maxCraterDiameter = 0;
  let highestProbability = 0;
  let mostDangerousNEO = null;

  processedDates.forEach(dateData => {
    totalNEOs += dateData.neoCount;
    
    dateData.neos.forEach(neo => {
      if (neo.isPotentiallyHazardous) hazardousCount++;
      
      if (neo.primaryApproach?.calculations) {
        const calc = neo.primaryApproach.calculations;
        
        if (calc.estimatedCrater?.diameter > maxCraterDiameter) {
          maxCraterDiameter = calc.estimatedCrater.diameter;
        }
        
        if (calc.impactProbability?.value > highestProbability) {
          highestProbability = calc.impactProbability.value;
          mostDangerousNEO = {
            name: neo.name,
            date: neo.primaryApproach.closeApproachDate,
            probability: calc.impactProbability.percentage,
            riskLevel: calc.impactProbability.riskLevel
          };
        }
      }
    });
  });

  return {
    totalNEOs,
    hazardousCount,
    nonHazardousCount: totalNEOs - hazardousCount,
    maxCraterDiameter: {
      value: maxCraterDiameter,
      unit: 'meters'
    },
    highestImpactProbability: {
      value: highestProbability,
      percentage: (highestProbability * 100).toFixed(8)
    },
    mostDangerousNEO
  };
}

module.exports = {
  processNEO,
  processNASAFeedData,
  calculateMass,
  calculateKineticEnergy,
  calculateCraterDiameter,
  estimateImpactProbability,
  CONSTANTS
};
