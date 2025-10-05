/**
 * Earthquake Magnitude Calculator for Asteroid Impacts
 * Calculates seismic effects based on impact energy and location
 * These calculations use the relationship between impact energy and seismic magnitude
 */

// Seismic Constants
const SEISMIC_CONSTANTS = {
  // Conversion factor from Joules to seismic magnitude
  // Based on the formula: M = (2/3) * log10(E) - 2.9
  // Where E is energy in Joules
  RICHTER_CONVERSION: 2 / 3,
  RICHTER_OFFSET: 2.9,
  
  // Energy efficiency: percentage of kinetic energy converted to seismic waves
  // Typical range: 0.1% to 1% for impacts
  SEISMIC_EFFICIENCY_LAND: 0.005,    // 0.5% for land impacts
  SEISMIC_EFFICIENCY_OCEAN: 0.002,   // 0.2% for ocean impacts (energy absorbed by water)
  
  // Attenuation factors based on geology
  CONTINENTAL_ATTENUATION: 0.85,
  OCEANIC_ATTENUATION: 0.65,
  
  // Reference values for scaling
  JOULES_PER_MEGATON: 4.184e15,     // 1 megaton TNT = 4.184 × 10^15 J
};

/**
 * Calculate seismic magnitude using the energy-magnitude relationship
 * Formula: M = (2/3) * log10(E) - 2.9
 * Where E is seismic energy in Joules
 * 
 * @param {number} kineticEnergy - Total kinetic energy in Joules
 * @param {boolean} isOceanImpact - Whether impact is in ocean
 * @param {string} region - Geographic region (for geological characteristics)
 * @returns {object} Seismic magnitude data
 */
function calculateSeismicMagnitude(kineticEnergy, isOceanImpact = false, region = 'Land') {
  try {
    // Determine seismic efficiency based on impact location
    const efficiency = isOceanImpact 
      ? SEISMIC_CONSTANTS.SEISMIC_EFFICIENCY_OCEAN 
      : SEISMIC_CONSTANTS.SEISMIC_EFFICIENCY_LAND;
    
    // Calculate seismic energy (only a fraction of kinetic energy converts to seismic waves)
    const seismicEnergy = kineticEnergy * efficiency;
    
    // Calculate Richter magnitude
    // M = (2/3) * log10(E) - 2.9
    const richterMagnitude = (SEISMIC_CONSTANTS.RICHTER_CONVERSION * Math.log10(seismicEnergy)) - SEISMIC_CONSTANTS.RICHTER_OFFSET;
    
    // Calculate moment magnitude (more accurate for large earthquakes)
    // Mw ≈ 2/3 * log10(E) - 10.7 (adjusted for impacts)
    const momentMagnitude = (SEISMIC_CONSTANTS.RICHTER_CONVERSION * Math.log10(seismicEnergy)) - 10.7 + 8.0;
    
    // Use moment magnitude for large events (M > 6.5), Richter for smaller
    const primaryMagnitude = richterMagnitude > 6.5 ? momentMagnitude : richterMagnitude;
    
    // Calculate energy released in megatons
    const energyMegatons = seismicEnergy / SEISMIC_CONSTANTS.JOULES_PER_MEGATON;
    
    return {
      richterMagnitude: parseFloat(richterMagnitude.toFixed(2)),
      momentMagnitude: parseFloat(momentMagnitude.toFixed(2)),
      primaryMagnitude: parseFloat(primaryMagnitude.toFixed(2)),
      seismicEnergy: {
        joules: seismicEnergy,
        megatons: parseFloat(energyMegatons.toFixed(4))
      },
      conversionEfficiency: efficiency,
      impactType: isOceanImpact ? 'Ocean' : 'Land',
      magnitudeClass: getMagnitudeClass(primaryMagnitude),
      equivalentEarthquake: getEquivalentEarthquake(primaryMagnitude)
    };
  } catch (error) {
    console.error('Error calculating seismic magnitude:', error);
    return {
      error: 'Failed to calculate seismic magnitude',
      details: error.message
    };
  }
}

/**
 * Classify earthquake magnitude
 * @param {number} magnitude - Earthquake magnitude
 * @returns {string} Classification
 */
function getMagnitudeClass(magnitude) {
  if (magnitude < 3.0) return 'Minor - Often not felt';
  if (magnitude < 4.0) return 'Light - Felt by many, rarely causes damage';
  if (magnitude < 5.0) return 'Moderate - Damage to poorly constructed buildings';
  if (magnitude < 6.0) return 'Strong - Damage to buildings in populated areas';
  if (magnitude < 7.0) return 'Major - Serious damage over large areas';
  if (magnitude < 8.0) return 'Great - Devastating damage over very large areas';
  return 'Epic - Catastrophic destruction across continents';
}

/**
 * Find equivalent historical earthquakes
 * @param {number} magnitude - Calculated magnitude
 * @returns {object} Equivalent earthquake reference
 */
function getEquivalentEarthquake(magnitude) {
  const historicalEvents = [
    { mag: 9.5, name: '1960 Valdivia, Chile', year: 1960, description: 'Largest recorded earthquake' },
    { mag: 9.2, name: '1964 Alaska', year: 1964, description: 'Second largest recorded' },
    { mag: 9.1, name: '2011 Tōhoku, Japan', year: 2011, description: 'Triggered devastating tsunami' },
    { mag: 9.0, name: '2004 Indian Ocean', year: 2004, description: 'Generated catastrophic tsunami' },
    { mag: 8.8, name: '2010 Chile', year: 2010, description: 'Major structural damage' },
    { mag: 7.9, name: '2008 Sichuan, China', year: 2008, description: 'Thousands of casualties' },
    { mag: 7.0, name: '2010 Haiti', year: 2010, description: 'Massive devastation in populated area' },
    { mag: 6.9, name: '1989 Loma Prieta, California', year: 1989, description: 'Significant damage to infrastructure' },
    { mag: 6.0, name: '2014 Napa, California', year: 2014, description: 'Strong shaking, moderate damage' },
    { mag: 5.0, name: 'Typical moderate earthquake', year: null, description: 'Felt widely, minor damage' }
  ];
  
  // Find closest match
  let closest = historicalEvents[historicalEvents.length - 1];
  let minDiff = Math.abs(magnitude - closest.mag);
  
  for (const event of historicalEvents) {
    const diff = Math.abs(magnitude - event.mag);
    if (diff < minDiff) {
      minDiff = diff;
      closest = event;
    }
  }
  
  return {
    magnitude: closest.mag,
    name: closest.name,
    year: closest.year,
    description: closest.description,
    comparison: magnitude > closest.mag ? 'stronger than' : magnitude < closest.mag ? 'weaker than' : 'similar to'
  };
}

/**
 * Calculate regional seismic effects based on distance from epicenter
 * @param {number} magnitude - Earthquake magnitude
 * @param {number} distanceKm - Distance from impact point in km
 * @param {string} region - Geographic region
 * @returns {object} Regional effects
 */
function calculateRegionalEffects(magnitude, distanceKm, region = 'Land') {
  const isOcean = region === 'Ocean';
  const attenuation = isOcean 
    ? SEISMIC_CONSTANTS.OCEANIC_ATTENUATION 
    : SEISMIC_CONSTANTS.CONTINENTAL_ATTENUATION;
  
  // Calculate magnitude at distance using attenuation
  // M(d) = M0 - β * log10(d/d0)
  // where β is attenuation coefficient (typically 1.5-3.0)
  const beta = isOcean ? 2.5 : 2.0;
  const referenceDistance = 100; // km
  
  const magnitudeAtDistance = magnitude - (beta * Math.log10(distanceKm / referenceDistance));
  
  // Calculate Modified Mercalli Intensity (MMI)
  // Rough conversion: MMI ≈ 1.5 * M - 1.5 * log10(d) + 1.78
  const mmi = Math.max(1, Math.min(12, 
    1.5 * magnitudeAtDistance - 1.5 * Math.log10(Math.max(1, distanceKm)) + 1.78
  ));
  
  return {
    distanceKm: distanceKm,
    magnitudeAtDistance: parseFloat(magnitudeAtDistance.toFixed(2)),
    modifiedMercalliIntensity: Math.round(mmi),
    intensityDescription: getMMIDescription(Math.round(mmi)),
    expectedDamage: getExpectedDamage(Math.round(mmi)),
    peakGroundAcceleration: calculatePGA(magnitudeAtDistance, distanceKm)
  };
}

/**
 * Get Modified Mercalli Intensity description
 * @param {number} mmi - MMI value (1-12)
 * @returns {string} Description
 */
function getMMIDescription(mmi) {
  const descriptions = {
    1: 'Not felt',
    2: 'Weak - Felt by few',
    3: 'Weak - Felt by many indoors',
    4: 'Light - Felt by most indoors',
    5: 'Moderate - Felt by all, some damage',
    6: 'Strong - Felt by all, significant damage',
    7: 'Very Strong - Difficult to stand',
    8: 'Severe - Heavy damage to buildings',
    9: 'Violent - Buildings collapse',
    10: 'Extreme - Most buildings destroyed',
    11: 'Extreme - Total destruction',
    12: 'Total - Complete devastation'
  };
  
  return descriptions[Math.min(12, Math.max(1, mmi))] || 'Unknown';
}

/**
 * Get expected damage description
 * @param {number} mmi - MMI value
 * @returns {string} Damage description
 */
function getExpectedDamage(mmi) {
  if (mmi <= 4) return 'No structural damage expected';
  if (mmi <= 6) return 'Minor to moderate damage to buildings';
  if (mmi <= 8) return 'Severe damage to buildings, infrastructure at risk';
  if (mmi <= 10) return 'Catastrophic damage, widespread collapse';
  return 'Total devastation, complete destruction of infrastructure';
}

/**
 * Calculate Peak Ground Acceleration (PGA)
 * @param {number} magnitude - Earthquake magnitude
 * @param {number} distanceKm - Distance in km
 * @returns {object} PGA data
 */
function calculatePGA(magnitude, distanceKm) {
  // Simplified attenuation relationship
  // log10(PGA) = a*M - b*log10(R) - c
  const a = 0.5;
  const b = 1.0;
  const c = 0.5;
  
  const logPGA = a * magnitude - b * Math.log10(Math.max(1, distanceKm)) - c;
  const pgaGs = Math.pow(10, logPGA); // in g's
  const pgaMS2 = pgaGs * 9.8; // convert to m/s²
  
  return {
    value: parseFloat(pgaGs.toFixed(4)),
    unit: 'g',
    metersPerSecondSquared: parseFloat(pgaMS2.toFixed(2)),
    description: getPGADescription(pgaGs)
  };
}

/**
 * Get PGA description
 * @param {number} pgaGs - PGA in g's
 * @returns {string} Description
 */
function getPGADescription(pgaGs) {
  if (pgaGs < 0.005) return 'Imperceptible';
  if (pgaGs < 0.05) return 'Weak shaking';
  if (pgaGs < 0.1) return 'Moderate shaking';
  if (pgaGs < 0.3) return 'Strong shaking';
  if (pgaGs < 0.6) return 'Very strong shaking';
  return 'Extreme shaking';
}

/**
 * Calculate aftershock probability
 * @param {number} magnitude - Main shock magnitude
 * @param {number} hoursAfter - Hours after main shock
 * @returns {object} Aftershock data
 */
function calculateAftershockProbability(magnitude, hoursAfter = 24) {
  // Omori's Law: n(t) = K / (c + t)^p
  // where K is productivity, c is time offset, p is decay rate
  const K = Math.pow(10, magnitude - 4); // productivity scales with magnitude
  const c = 0.1; // hours
  const p = 1.1; // decay exponent
  
  const ratePerHour = K / Math.pow(c + hoursAfter, p);
  const expectedCount = ratePerHour * 24; // next 24 hours
  
  // Largest expected aftershock (typically M - 1.2)
  const largestAftershock = magnitude - 1.2;
  
  return {
    expectedAftershocksNext24h: Math.round(expectedCount),
    expectedLargestMagnitude: parseFloat(largestAftershock.toFixed(1)),
    rateDecay: 'Exponential decay following Omori\'s Law',
    duration: magnitude > 7 ? 'Months to years' : 'Days to weeks'
  };
}

/**
 * Main function to add earthquake data to impact calculations
 * @param {object} impactData - Impact data from customHitHandler
 * @returns {object} Enhanced data with earthquake calculations
 */
function addEarthquakeData(impactData) {
  try {
    const kineticEnergy = impactData.calculations?.kineticEnergy?.value;
    const location = impactData.geographicImpactData?.geographicRisk;
    const impactPoint = impactData.geographicImpactData?.impactLocation?.estimatedImpactPoint;
    
    if (!kineticEnergy) {
      return {
        ...impactData,
        earthquakeData: {
          error: 'Kinetic energy not available for calculation'
        }
      };
    }
    
    // Determine if ocean impact
    const isOceanImpact = location?.primaryRegion === 'Ocean';
    const region = location?.primaryRegion || 'Land';
    
    // Calculate seismic magnitude
    const seismicData = calculateSeismicMagnitude(kineticEnergy, isOceanImpact, region);
    
    // Calculate regional effects at various distances
    const regionalEffects = {
      epicenter: calculateRegionalEffects(seismicData.primaryMagnitude, 10, region),
      nearField: calculateRegionalEffects(seismicData.primaryMagnitude, 100, region),
      farField: calculateRegionalEffects(seismicData.primaryMagnitude, 500, region),
      distant: calculateRegionalEffects(seismicData.primaryMagnitude, 2000, region)
    };
    
    // Calculate aftershock probability
    const aftershocks = calculateAftershockProbability(seismicData.primaryMagnitude);
    
    // Add tsunami warning if ocean impact with high magnitude
    let tsunamiWarning = null;
    if (isOceanImpact && seismicData.primaryMagnitude >= 7.0) {
      tsunamiWarning = {
        risk: 'HIGH',
        message: 'Ocean impact with high seismic magnitude. Tsunami generation likely.',
        estimatedWaveHeight: `${Math.round(Math.pow(10, seismicData.primaryMagnitude - 6))} - ${Math.round(Math.pow(10, seismicData.primaryMagnitude - 5))} meters`,
        affectedCoastlines: 'All coastlines within 1000+ km',
        arrivalTime: '15-60 minutes for nearby coasts, hours for distant coasts'
      };
    }
    
    return {
      ...impactData,
      earthquakeData: {
        seismicMagnitude: seismicData,
        regionalEffects: regionalEffects,
        aftershockPrediction: aftershocks,
        tsunamiWarning: tsunamiWarning,
        comparisonToNaturalEvents: {
          energyReleased: `${(kineticEnergy / SEISMIC_CONSTANTS.JOULES_PER_MEGATON).toFixed(2)} megatons TNT`,
          note: 'For reference, the largest nuclear weapon ever tested was 50 megatons',
          naturalEarthquakeEquivalent: seismicData.equivalentEarthquake
        },
        globalImpact: getGlobalImpact(seismicData.primaryMagnitude),
        warnings: generateWarnings(seismicData.primaryMagnitude, isOceanImpact, location)
      }
    };
  } catch (error) {
    console.error('Error adding earthquake data:', error);
    return {
      ...impactData,
      earthquakeData: {
        error: 'Failed to calculate earthquake data',
        details: error.message
      }
    };
  }
}

/**
 * Determine global impact level
 * @param {number} magnitude - Earthquake magnitude
 * @returns {object} Global impact assessment
 */
function getGlobalImpact(magnitude) {
  if (magnitude >= 9.5) {
    return {
      level: 'EXTINCTION-LEVEL',
      description: 'Global catastrophe, potential mass extinction event',
      societalImpact: 'Complete collapse of global civilization',
      economicImpact: 'Incalculable',
      casualties: 'Billions'
    };
  } else if (magnitude >= 8.5) {
    return {
      level: 'CONTINENTAL',
      description: 'Continental-scale devastation',
      societalImpact: 'Multiple nations severely affected',
      economicImpact: 'Trillions of dollars',
      casualties: 'Millions to tens of millions'
    };
  } else if (magnitude >= 7.5) {
    return {
      level: 'REGIONAL',
      description: 'Major regional disaster',
      societalImpact: 'Regional infrastructure collapse',
      economicImpact: 'Hundreds of billions',
      casualties: 'Hundreds of thousands to millions'
    };
  } else if (magnitude >= 6.5) {
    return {
      level: 'SIGNIFICANT',
      description: 'Significant local disaster',
      societalImpact: 'Local disruption, potential displacement',
      economicImpact: 'Tens of billions',
      casualties: 'Thousands to hundreds of thousands'
    };
  } else {
    return {
      level: 'MODERATE',
      description: 'Localized effects',
      societalImpact: 'Limited disruption',
      economicImpact: 'Millions to billions',
      casualties: 'Hundreds to thousands'
    };
  }
}

/**
 * Generate warnings based on earthquake data
 * @param {number} magnitude - Earthquake magnitude
 * @param {boolean} isOceanImpact - Ocean impact flag
 * @param {object} location - Location data
 * @returns {array} Warning messages
 */
function generateWarnings(magnitude, isOceanImpact, location) {
  const warnings = [];
  
  if (magnitude >= 7.0) {
    warnings.push({
      severity: 'CRITICAL',
      message: 'Major earthquake expected. Immediate evacuation recommended for all areas within 500 km.'
    });
  }
  
  if (isOceanImpact && magnitude >= 7.0) {
    warnings.push({
      severity: 'CRITICAL',
      message: 'TSUNAMI WARNING: Evacuate all coastal areas immediately. Move to high ground.'
    });
  }
  
  if (magnitude >= 8.0) {
    warnings.push({
      severity: 'EXTREME',
      message: 'Catastrophic earthquake. Effects will be felt across multiple regions. Prepare for extended disruption.'
    });
  }
  
  if (location?.riskLevel === 'CATASTROPHIC') {
    warnings.push({
      severity: 'CRITICAL',
      message: 'Impact in populated area. Mass casualty event anticipated.'
    });
  }
  
  warnings.push({
    severity: 'INFO',
    message: 'Aftershocks expected for days to weeks following the main event.'
  });
  
  return warnings;
}

module.exports = {
  calculateSeismicMagnitude,
  calculateRegionalEffects,
  calculateAftershockProbability,
  addEarthquakeData,
  getGlobalImpact,
  SEISMIC_CONSTANTS
};