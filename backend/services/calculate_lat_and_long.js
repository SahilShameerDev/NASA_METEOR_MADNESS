/**
 * Latitude and Longitude Impact Location Calculator
 * Calculates potential impact coordinates based on orbital mechanics
 * These calculations were implemented using AI assistance.
 */

const { DateTime } = require('luxon');

// Earth Constants
const EARTH_CONSTANTS = {
  RADIUS_KM: 6371,                    // Mean Earth radius in km
  ROTATION_PERIOD_HOURS: 23.9344696,  // Sidereal day in hours
  DEGREES_PER_HOUR: 360 / 23.9344696, // Earth's rotation rate in degrees/hour
  EQUATORIAL_RADIUS_KM: 6378.137,     // Equatorial radius in km
  POLAR_RADIUS_KM: 6356.752,          // Polar radius in km
  OBLIQUITY: 23.44                    // Earth's axial tilt in degrees
};

/**
 * Convert Cartesian coordinates to Latitude/Longitude
 * @param {number} x - X coordinate in km
 * @param {number} y - Y coordinate in km
 * @param {number} z - Z coordinate in km
 * @returns {object} Latitude and Longitude in degrees
 */
function cartesianToLatLong(x, y, z) {
  // Calculate longitude (simple for spherical Earth)
  const longitude = Math.atan2(y, x) * (180 / Math.PI);
  
  // Calculate latitude
  const r = Math.sqrt(x * x + y * y);
  const latitude = Math.atan2(z, r) * (180 / Math.PI);
  
  return {
    latitude: latitude,
    longitude: longitude
  };
}

/**
 * Calculate the subsatellite point (ground track) at a given time
 * This represents where directly below the object is on Earth's surface
 * @param {Date} approachDate - Date/time of approach
 * @param {number} rightAscension - Right ascension in degrees (0-360)
 * @param {number} declination - Declination in degrees (-90 to +90)
 * @returns {object} Latitude and Longitude
 */
function calculateSubsatellitePoint(approachDate, rightAscension, declination) {
  // The latitude is simply the declination
  const latitude = declination;
  
  // For longitude, we need to account for Earth's rotation
  // This is a simplified calculation
  const dt = DateTime.fromJSDate(approachDate);
  
  // Calculate Greenwich Mean Sidereal Time (simplified)
  // This is the angle between the vernal equinox and the Greenwich meridian
  const J2000 = DateTime.fromObject({ year: 2000, month: 1, day: 1, hour: 12 });
  const daysSinceJ2000 = dt.diff(J2000, 'days').days;
  
  // GMST at 0h UT
  const gmst0 = 280.46061837 + 360.98564736629 * daysSinceJ2000;
  
  // Add the time of day
  const hourOfDay = dt.hour + (dt.minute / 60) + (dt.second / 3600);
  const gmst = (gmst0 + 15.04107 * hourOfDay) % 360;
  
  // Longitude is right ascension minus GMST
  let longitude = rightAscension - gmst;
  
  // Normalize to -180 to +180
  while (longitude > 180) longitude -= 360;
  while (longitude < -180) longitude += 360;
  
  return {
    latitude: latitude,
    longitude: longitude
  };
}

/**
 * Estimate impact location based on velocity vector and approach geometry
 * @param {object} approachData - Close approach data
 * @param {number} missDistanceKm - Miss distance in kilometers
 * @returns {object} Estimated impact coordinates and metadata
 */
function estimateImpactLocation(approachData, missDistanceKm) {
  try {
    // Safely parse the date - handle both NASA API format and our processed format
    const dateStr = approachData.close_approach_date_full 
      || approachData.close_approach_date 
      || approachData.closeApproachDateFull 
      || approachData.closeApproachDate;
      
    if (!dateStr) {
      return {
        error: 'No approach date available',
        estimatedImpactPoint: null
      };
    }
    
    const approachDate = new Date(dateStr);
    
    // Validate the date
    if (isNaN(approachDate.getTime())) {
      return {
        error: 'Invalid approach date',
        estimatedImpactPoint: null,
        rawDate: dateStr
      };
    }
    
    // For objects that would impact, we estimate based on approach geometry
    // This is a simplified model using random distribution weighted by population
    
    // If miss distance is very small, calculate more precise impact location
    if (missDistanceKm < EARTH_CONSTANTS.RADIUS_KM * 2) {
      // Generate a realistic impact location
      // In reality, this would require full orbital integration
      
      // Use approach time to estimate longitude
      const dt = DateTime.fromJSDate(approachDate);
      
      // Validate luxon DateTime
      if (!dt.isValid) {
        return {
          error: 'Invalid DateTime conversion',
          estimatedImpactPoint: null
        };
      }
      
      const hourOfDay = dt.hour + (dt.minute / 60);
      
      // Simplified: longitude based on time of day
      // (Objects approach from the sun-facing side typically)
      const baseLongitude = (hourOfDay * 15) - 180; // Convert hour to longitude
      
      // Add some variation based on approach velocity angle
      const velocityKmS = approachData.relative_velocity?.kilometers_per_second || 20;
      const longitudeVariation = (velocityKmS % 60) - 30; // -30 to +30 degrees variation
      
      let longitude = baseLongitude + longitudeVariation;
      
      // Normalize longitude
      while (longitude > 180) longitude -= 360;
      while (longitude < -180) longitude += 360;
      
      // Estimate latitude based on orbital inclination
      // Most NEOs have low inclination, so impacts are more likely near equator
      // Using a normal distribution centered at equator
      const latitudeVariation = (Math.random() - 0.5) * 60; // ±30 degrees from equator
      const latitude = latitudeVariation * 0.7; // Bias towards equator
      
      return {
        estimatedImpactPoint: {
          latitude: parseFloat(latitude.toFixed(4)),
          longitude: parseFloat(longitude.toFixed(4)),
          confidence: 'low',
          note: 'This is a simplified estimate. Actual impact location requires precise orbital integration.'
        },
        impactTimestamp: approachDate.toISOString(),
        coordinateSystem: 'WGS84'
      };
    }
    
    // For objects with larger miss distances, provide uncertainty zone
    return {
      estimatedImpactPoint: null,
      uncertaintyZone: {
        type: 'global',
        note: `Miss distance of ${missDistanceKm.toFixed(0)} km indicates no impact. Location calculation not applicable.`
      },
      impactTimestamp: approachDate.toISOString()
    };
    
  } catch (error) {
    console.error('Error estimating impact location:', error);
    return {
      error: 'Failed to calculate impact location',
      details: error.message,
      estimatedImpactPoint: null
    };
  }
}

/**
 * Calculate multiple potential impact points using Monte Carlo approach
 * @param {object} approachData - Close approach data
 * @param {number} missDistanceKm - Miss distance in km
 * @param {number} uncertaintyKm - Positional uncertainty in km
 * @param {number} samples - Number of Monte Carlo samples
 * @returns {array} Array of potential impact coordinates
 */
function calculateImpactProbabilityMap(approachData, missDistanceKm, uncertaintyKm = 1000, samples = 100) {
  const impactPoints = [];
  
  // Only calculate if object is potentially hazardous (close approach)
  if (missDistanceKm > EARTH_CONSTANTS.RADIUS_KM * 5) {
    return {
      impactPoints: [],
      note: 'Object passes too far from Earth for meaningful impact probability mapping'
    };
  }
  
  try {
    // Safely parse the date - handle both NASA API format and our processed format
    const dateStr = approachData.close_approach_date_full 
      || approachData.close_approach_date 
      || approachData.closeApproachDateFull 
      || approachData.closeApproachDate;
      
    if (!dateStr) {
      return {
        impactPoints: [],
        error: 'No approach date available'
      };
    }
    
    const approachDate = new Date(dateStr);
    
    // Validate the date
    if (isNaN(approachDate.getTime())) {
      return {
        impactPoints: [],
        error: 'Invalid approach date'
      };
    }
    
    const dt = DateTime.fromJSDate(approachDate);
    
    // Validate luxon DateTime
    if (!dt.isValid) {
      return {
        impactPoints: [],
        error: 'Invalid DateTime conversion'
      };
    }
    
    // Generate samples around the nominal trajectory
    for (let i = 0; i < samples; i++) {
      // Add random variation to simulate orbital uncertainty
      const latVariation = (Math.random() - 0.5) * (uncertaintyKm / EARTH_CONSTANTS.RADIUS_KM) * 57.3; // Convert to degrees
      const lonVariation = (Math.random() - 0.5) * (uncertaintyKm / EARTH_CONSTANTS.RADIUS_KM) * 57.3;
      
      // Base coordinates
      const baseLon = (dt.hour * 15) - 180;
      
      const latitude = latVariation;
      let longitude = baseLon + lonVariation;
      
      // Normalize
      while (longitude > 180) longitude -= 360;
      while (longitude < -180) longitude += 360;
      
      impactPoints.push({
        latitude: parseFloat(latitude.toFixed(4)),
        longitude: parseFloat(longitude.toFixed(4)),
        probability: 1 / samples // Equal probability for each sample in this simplified model
      });
    }
    
    return {
      impactPoints: impactPoints,
      samples: samples,
      uncertaintyKm: uncertaintyKm,
      method: 'Monte Carlo simulation (simplified)',
      note: 'This is a demonstration. Real calculations require full orbital covariance analysis.'
    };
    
  } catch (error) {
    console.error('Error calculating impact probability map:', error);
    return {
      impactPoints: [],
      error: error.message
    };
  }
}

/**
 * Determine which geographic regions are at risk
 * @param {object} impactLocation - Impact location data
 * @param {number} craterRadiusKm - Estimated crater radius in km
 * @returns {object} Geographic risk assessment
 */
function assessGeographicRisk(impactLocation, craterRadiusKm) {
  if (!impactLocation?.estimatedImpactPoint) {
    return {
      risk: 'none',
      note: 'No impact predicted'
    };
  }
  
  const { latitude, longitude } = impactLocation.estimatedImpactPoint;
  
  // Simplified region detection based on coordinates
  let region = 'Ocean';
  let continent = null;
  
  // Very simplified continent detection
  if (latitude > 35 && latitude < 70) {
    if (longitude > -10 && longitude < 40) {
      region = 'Europe';
      continent = 'Europe';
    } else if (longitude > 40 && longitude < 180) {
      region = 'Asia';
      continent = 'Asia';
    } else if (longitude > -130 && longitude < -60) {
      region = 'North America';
      continent = 'North America';
    }
  } else if (latitude > -35 && latitude < 35) {
    if (longitude > -20 && longitude < 55) {
      region = 'Africa';
      continent = 'Africa';
    } else if (longitude > 90 && longitude < 150) {
      region = 'Southeast Asia';
      continent = 'Asia';
    } else if (longitude > -90 && longitude < -30) {
      region = 'South America';
      continent = 'South America';
    }
  } else if (latitude > -90 && latitude < -35) {
    if (longitude > 110 && longitude < 180) {
      region = 'Australia';
      continent = 'Australia';
    }
  }
  
  // Calculate affected area (simplified circle)
  const affectedAreaKm2 = Math.PI * Math.pow(craterRadiusKm * 3, 2); // 3x crater radius for blast effects
  
  return {
    primaryRegion: region,
    continent: continent,
    coordinates: {
      latitude: latitude,
      longitude: longitude
    },
    craterRadius: {
      value: craterRadiusKm,
      unit: 'km'
    },
    estimatedAffectedArea: {
      value: affectedAreaKm2,
      unit: 'km²'
    },
    riskLevel: determineRegionalRiskLevel(region, affectedAreaKm2)
  };
}

/**
 * Determine regional risk level based on location and impact size
 * @param {string} region - Geographic region
 * @param {number} affectedAreaKm2 - Affected area in km²
 * @returns {string} Risk level
 */
function determineRegionalRiskLevel(region, affectedAreaKm2) {
  const isPopulated = region !== 'Ocean' && region !== 'Antarctica';
  
  if (affectedAreaKm2 > 100000) {
    return isPopulated ? 'CATASTROPHIC' : 'SEVERE';
  } else if (affectedAreaKm2 > 10000) {
    return isPopulated ? 'SEVERE' : 'HIGH';
  } else if (affectedAreaKm2 > 1000) {
    return isPopulated ? 'HIGH' : 'MODERATE';
  } else if (affectedAreaKm2 > 100) {
    return isPopulated ? 'MODERATE' : 'LOW';
  }
  return 'LOW';
}

/**
 * Main function to process NEO and add geographic impact data
 * @param {object} neoData - Processed NEO data from calculate_hit.js
 * @returns {object} NEO data enhanced with geographic information
 */
function addGeographicImpactData(neoData) {
  if (!neoData.primaryApproach) {
    return neoData;
  }
  
  const approach = neoData.primaryApproach;
  const missDistanceKm = approach.missDistance?.kilometers || 0;
  const craterRadiusKm = (approach.calculations?.estimatedCrater?.radius || 0) / 1000; // Convert m to km
  
  // Estimate impact location
  const impactLocation = estimateImpactLocation(approach, missDistanceKm);
  
  // Add geographic risk assessment if impact is possible
  let geographicRisk = null;
  if (impactLocation.estimatedImpactPoint) {
    geographicRisk = assessGeographicRisk(impactLocation, craterRadiusKm);
  }
  
  // Add probability map for close approaches
  let probabilityMap = null;
  if (missDistanceKm < EARTH_CONSTANTS.RADIUS_KM * 5) {
    probabilityMap = calculateImpactProbabilityMap(approach, missDistanceKm, 1000, 50);
  }
  
  // Enhance the NEO data with geographic information
  return {
    ...neoData,
    geographicImpactData: {
      impactLocation: impactLocation,
      geographicRisk: geographicRisk,
      probabilityMap: probabilityMap,
      earthRotationData: {
        rotationPeriod: EARTH_CONSTANTS.ROTATION_PERIOD_HOURS,
        degreesPerHour: EARTH_CONSTANTS.DEGREES_PER_HOUR,
        note: 'Earth rotation affects the exact impact location within the uncertainty window'
      }
    }
  };
}

module.exports = {
  estimateImpactLocation,
  calculateImpactProbabilityMap,
  assessGeographicRisk,
  addGeographicImpactData,
  cartesianToLatLong,
  calculateSubsatellitePoint,
  EARTH_CONSTANTS
};
