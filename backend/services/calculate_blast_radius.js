/**
 * Blast Radius Calculator for Asteroid Impacts
 * Calculates various destructive effects at different distances from impact
 * Uses scaled nuclear weapon equations adapted for kinetic impactors
 */

// Blast Effect Constants
const BLAST_CONSTANTS = {
  // Overpressure thresholds (in PSI - pounds per square inch)
  OVERPRESSURE: {
    TOTAL_DESTRUCTION: 20,      // 138 kPa - Complete destruction
    SEVERE_DAMAGE: 10,           // 69 kPa - Severe structural damage
    MODERATE_DAMAGE: 5,          // 34 kPa - Moderate damage
    LIGHT_DAMAGE: 2,             // 14 kPa - Light damage
    MINOR_DAMAGE: 1,             // 7 kPa - Minor damage
    GLASS_BREAKAGE: 0.5          // 3.4 kPa - Window breakage
  },
  
  // Thermal radiation thresholds (cal/cm²)
  THERMAL: {
    VAPORIZATION: 500,           // Complete vaporization
    THIRD_DEGREE_BURNS: 100,     // Third-degree burns (fatal)
    SECOND_DEGREE_BURNS: 40,     // Second-degree burns
    FIRST_DEGREE_BURNS: 10,      // First-degree burns
    IGNITION: 20                 // Ignition of materials
  },
  
  // Conversion factors
  JOULES_PER_MEGATON: 4.184e15,  // 1 megaton TNT
  JOULES_PER_KILOTON: 4.184e12,  // 1 kiloton TNT
  
  // Scaling factors for different impact scenarios
  AIRBURST_EFFICIENCY: 1.5,      // Airbursts are more efficient
  SURFACE_EFFICIENCY: 1.0,       // Surface impacts
  SHALLOW_WATER_EFFICIENCY: 0.7, // Water absorbs energy
  DEEP_WATER_EFFICIENCY: 0.5     // Deep water absorbs more
};

/**
 * Calculate blast radius using Rankine-Hugoniot equations
 * Scaled cube-root law: R = C × Y^(1/3)
 * Where R = radius (km), Y = yield (megatons), C = scaling constant
 * 
 * @param {number} energyJoules - Impact energy in Joules
 * @param {number} overpressurePSI - Target overpressure in PSI
 * @param {string} impactType - Type of impact
 * @returns {number} Radius in kilometers
 */
function calculateBlastRadius(energyJoules, overpressurePSI, impactType = 'surface') {
  // Convert energy to megatons
  const yieldMegatons = energyJoules / BLAST_CONSTANTS.JOULES_PER_MEGATON;
  
  // Empirical scaling constants for different overpressures
  // Based on nuclear weapon data and scaled for impacts
  let scalingConstant;
  if (overpressurePSI >= 20) {
    scalingConstant = 0.28;      // 20 PSI - Total destruction
  } else if (overpressurePSI >= 10) {
    scalingConstant = 0.40;      // 10 PSI - Severe damage
  } else if (overpressurePSI >= 5) {
    scalingConstant = 0.61;      // 5 PSI - Moderate damage
  } else if (overpressurePSI >= 2) {
    scalingConstant = 1.04;      // 2 PSI - Light damage
  } else if (overpressurePSI >= 1) {
    scalingConstant = 1.50;      // 1 PSI - Minor damage
  } else {
    scalingConstant = 2.20;      // 0.5 PSI - Glass breakage
  }
  
  // Apply impact type efficiency factor
  let efficiency = BLAST_CONSTANTS.SURFACE_EFFICIENCY;
  if (impactType === 'airburst') {
    efficiency = BLAST_CONSTANTS.AIRBURST_EFFICIENCY;
  } else if (impactType === 'shallow_water') {
    efficiency = BLAST_CONSTANTS.SHALLOW_WATER_EFFICIENCY;
  } else if (impactType === 'deep_water') {
    efficiency = BLAST_CONSTANTS.DEEP_WATER_EFFICIENCY;
  }
  
  // Calculate radius using cube-root scaling
  // R = C × (Y × efficiency)^(1/3)
  const effectiveYield = yieldMegatons * efficiency;
  const radius = scalingConstant * Math.pow(effectiveYield, 1/3);
  
  return Math.max(0, radius);
}

/**
 * Calculate thermal radiation radius
 * Based on Stefan-Boltzmann law and atmospheric transmission
 * Q = E / (4πr²) where Q is thermal fluence
 * 
 * @param {number} energyJoules - Impact energy in Joules
 * @param {number} thermalThreshold - Thermal fluence threshold (cal/cm²)
 * @returns {number} Radius in kilometers
 */
function calculateThermalRadius(energyJoules, thermalThreshold) {
  const yieldMegatons = energyJoules / BLAST_CONSTANTS.JOULES_PER_MEGATON;
  
  // Thermal radiation scales as Y^0.41 (slightly different from cube root)
  // Atmospheric absorption factor included
  const atmosphericTransmission = 0.5; // ~50% reaches ground
  
  // R = k × (Y^0.41) / sqrt(Q)
  // Where k is scaling constant (~1.8 for clear atmosphere)
  const k = 1.8;
  const radius = k * Math.pow(yieldMegatons * atmosphericTransmission, 0.41) / Math.sqrt(thermalThreshold / 100);
  
  return Math.max(0, radius);
}

/**
 * Calculate fireball radius
 * Initial fireball from impact
 * 
 * @param {number} energyJoules - Impact energy in Joules
 * @returns {number} Radius in kilometers
 */
function calculateFireballRadius(energyJoules) {
  const yieldMegatons = energyJoules / BLAST_CONSTANTS.JOULES_PER_MEGATON;
  
  // Fireball radius scales as Y^0.4
  // R_fireball ≈ 0.09 × Y^0.4 km
  const radius = 0.09 * Math.pow(yieldMegatons, 0.4);
  
  return radius;
}

/**
 * Calculate mushroom cloud dimensions (for large impacts)
 * @param {number} energyJoules - Impact energy in Joules
 * @returns {object} Cloud dimensions
 */
function calculateMushroomCloud(energyJoules) {
  const yieldMegatons = energyJoules / BLAST_CONSTANTS.JOULES_PER_MEGATON;
  
  // Only significant for large impacts
  if (yieldMegatons < 0.1) {
    return null;
  }
  
  // Height scales as Y^0.25
  const height = 6.0 * Math.pow(yieldMegatons, 0.25); // km
  
  // Cap width scales as Y^0.4
  const capWidth = 3.0 * Math.pow(yieldMegatons, 0.4); // km
  
  return {
    height: height,
    capWidth: capWidth,
    description: 'Mushroom cloud formation',
    reachesStratosphere: height > 15,
    globalDistribution: yieldMegatons > 100
  };
}

/**
 * Calculate crater ejecta distribution
 * @param {number} craterRadiusKm - Crater radius in km
 * @param {number} energyJoules - Impact energy in Joules
 * @returns {object} Ejecta distribution data
 */
function calculateEjectaDistribution(craterRadiusKm, energyJoules) {
  const yieldMegatons = energyJoules / BLAST_CONSTANTS.JOULES_PER_MEGATON;
  
  // Ejecta blanket: 2-4 crater radii
  const ejectaBlanketRadius = craterRadiusKm * 3;
  const ejectaBlanketThickness = craterRadiusKm * 0.1; // Average thickness
  
  // Large fragments: 5-10 crater radii
  const largeFragmentRange = craterRadiusKm * 7;
  
  // Fine ejecta and dust plume
  const dustCloudRadius = Math.min(craterRadiusKm * 20, 1000);
  
  return {
    continuousEjectaBlanket: {
      radius: ejectaBlanketRadius,
      thickness: ejectaBlanketThickness,
      description: 'Continuous blanket of melted and pulverized rock',
      effect: 'Complete burial of everything',
      material: 'Impact melt, breccia, shocked rock'
    },
    discontinuousEjecta: {
      radius: largeFragmentRange,
      description: 'Boulder-sized to car-sized projectiles',
      effect: 'Ballistic impacts causing secondary craters',
      velocity: '100-500 m/s'
    },
    dustAndVapor: {
      radius: dustCloudRadius,
      description: 'Fine dust and vaporized material',
      effect: 'Reduced visibility, respiratory hazard, climate impact',
      particleSize: '<1 mm to aerosols',
      atmospheric: yieldMegatons > 10
    }
  };
}

/**
 * Calculate wind/blast wave effects
 * @param {number} energyJoules - Impact energy in Joules
 * @param {number} distanceKm - Distance from impact
 * @returns {object} Wind effects at distance
 */
function calculateWindSpeed(energyJoules, distanceKm) {
  const yieldMegatons = energyJoules / BLAST_CONSTANTS.JOULES_PER_MEGATON;
  
  // Peak wind velocity (m/s) as function of overpressure
  // v ≈ 5 × P^0.5 where P is overpressure in PSI
  
  // First calculate overpressure at distance
  // P = P0 × (R0/R)^α where α ≈ 1.5 for blast waves
  const referenceOverpressure = 10; // PSI at reference distance
  const referenceDistance = 0.40 * Math.pow(yieldMegatons, 1/3);
  
  const overpressure = referenceOverpressure * Math.pow(referenceDistance / Math.max(distanceKm, 0.1), 1.5);
  
  // Calculate wind speed
  const windSpeedMS = 5 * Math.sqrt(Math.max(0, overpressure));
  const windSpeedKMH = windSpeedMS * 3.6;
  
  return {
    speedMetersPerSecond: windSpeedMS,
    speedKilometersPerHour: windSpeedKMH,
    speedMilesPerHour: windSpeedKMH / 1.609,
    overpressure: overpressure,
    category: getWindCategory(windSpeedKMH)
  };
}

/**
 * Get wind category description
 * @param {number} speedKMH - Wind speed in km/h
 * @returns {string} Category description
 */
function getWindCategory(speedKMH) {
  if (speedKMH >= 500) return 'Hypersonic - Complete destruction';
  if (speedKMH >= 300) return 'Hurricane Category 5+ - Catastrophic';
  if (speedKMH >= 200) return 'Hurricane Category 3-4 - Devastating';
  if (speedKMH >= 150) return 'Hurricane Category 2 - Extensive damage';
  if (speedKMH >= 100) return 'Hurricane Category 1 - Significant damage';
  if (speedKMH >= 75) return 'Tropical Storm - Moderate damage';
  if (speedKMH >= 50) return 'Strong winds - Minor damage';
  return 'Light winds - Minimal damage';
}

/**
 * Calculate all blast effects comprehensively
 * @param {number} energyJoules - Impact energy in Joules
 * @param {number} craterRadiusKm - Crater radius in km
 * @param {string} impactType - Type of impact
 * @returns {object} Complete blast effects data
 */
function calculateAllBlastEffects(energyJoules, craterRadiusKm, impactType = 'surface') {
  const yieldMegatons = energyJoules / BLAST_CONSTANTS.JOULES_PER_MEGATON;
  const yieldKilotons = yieldMegatons * 1000;
  
  // Calculate fireball
  const fireballRadius = calculateFireballRadius(energyJoules);
  const fireballDuration = 0.3 * Math.pow(yieldMegatons, 0.4); // seconds
  const fireballTemp = 5700 * Math.pow(yieldMegatons, 0.1); // Kelvin
  
  // Calculate mushroom cloud (if applicable)
  const mushroomCloud = calculateMushroomCloud(energyJoules);
  
  // Calculate blast radii for different overpressure zones
  const blastZones = {
    totalDestruction: {
      radius: calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.TOTAL_DESTRUCTION, impactType),
      overpressure: BLAST_CONSTANTS.OVERPRESSURE.TOTAL_DESTRUCTION,
      overpressureKPa: BLAST_CONSTANTS.OVERPRESSURE.TOTAL_DESTRUCTION * 6.895,
      description: '20 PSI - Total Destruction Zone',
      effects: [
        'Complete destruction of all structures',
        'Reinforced concrete buildings severely damaged or collapsed',
        'Multi-story buildings completely destroyed',
        'Near 100% fatality rate',
        'Cratering and ground deformation'
      ],
      windSpeed: calculateWindSpeed(energyJoules, calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.TOTAL_DESTRUCTION, impactType)),
      survivability: '0-1%'
    },
    severeBlastDamage: {
      radius: calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.SEVERE_DAMAGE, impactType),
      overpressure: BLAST_CONSTANTS.OVERPRESSURE.SEVERE_DAMAGE,
      overpressureKPa: BLAST_CONSTANTS.OVERPRESSURE.SEVERE_DAMAGE * 6.895,
      description: '10 PSI - Severe Damage Zone',
      effects: [
        'Heavily damaged reinforced buildings',
        'Residential buildings collapsed',
        'Severe injuries from debris and collapse',
        '~95% fatality rate without shelter',
        'Major infrastructure destruction'
      ],
      windSpeed: calculateWindSpeed(energyJoules, calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.SEVERE_DAMAGE, impactType)),
      survivability: '5-10%'
    },
    moderateBlastDamage: {
      radius: calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.MODERATE_DAMAGE, impactType),
      overpressure: BLAST_CONSTANTS.OVERPRESSURE.MODERATE_DAMAGE,
      overpressureKPa: BLAST_CONSTANTS.OVERPRESSURE.MODERATE_DAMAGE * 6.895,
      description: '5 PSI - Moderate Damage Zone',
      effects: [
        'Moderate damage to buildings',
        'Wood frame buildings severely damaged',
        'Serious injuries common',
        'Widespread structural failures',
        'Flying debris hazard'
      ],
      windSpeed: calculateWindSpeed(energyJoules, calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.MODERATE_DAMAGE, impactType)),
      survivability: '30-50%'
    },
    lightBlastDamage: {
      radius: calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.LIGHT_DAMAGE, impactType),
      overpressure: BLAST_CONSTANTS.OVERPRESSURE.LIGHT_DAMAGE,
      overpressureKPa: BLAST_CONSTANTS.OVERPRESSURE.LIGHT_DAMAGE * 6.895,
      description: '2 PSI - Light Damage Zone',
      effects: [
        'Light structural damage to buildings',
        'Doors and windows blown out',
        'Injuries from flying glass and debris',
        'Interior walls damaged',
        'Minor building collapse'
      ],
      windSpeed: calculateWindSpeed(energyJoules, calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.LIGHT_DAMAGE, impactType)),
      survivability: '70-85%'
    },
    minorDamage: {
      radius: calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.MINOR_DAMAGE, impactType),
      overpressure: BLAST_CONSTANTS.OVERPRESSURE.MINOR_DAMAGE,
      overpressureKPa: BLAST_CONSTANTS.OVERPRESSURE.MINOR_DAMAGE * 6.895,
      description: '1 PSI - Minor Damage Zone',
      effects: [
        'Shattered windows',
        'Minor structural damage',
        'Injuries from flying glass',
        'Doors displaced',
        'Light fixtures damaged'
      ],
      windSpeed: calculateWindSpeed(energyJoules, calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.MINOR_DAMAGE, impactType)),
      survivability: '>95%'
    },
    glassBreakage: {
      radius: calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.GLASS_BREAKAGE, impactType),
      overpressure: BLAST_CONSTANTS.OVERPRESSURE.GLASS_BREAKAGE,
      overpressureKPa: BLAST_CONSTANTS.OVERPRESSURE.GLASS_BREAKAGE * 6.895,
      description: '0.5 PSI - Glass Breakage Zone',
      effects: [
        'Window breakage',
        'Cosmetic damage',
        'Minor injuries from glass',
        'No structural damage',
        'Loud noise and shaking'
      ],
      windSpeed: calculateWindSpeed(energyJoules, calculateBlastRadius(energyJoules, BLAST_CONSTANTS.OVERPRESSURE.GLASS_BREAKAGE, impactType)),
      survivability: '>99%'
    }
  };
  
  // Calculate thermal radiation effects
  const thermalEffects = {
    vaporization: {
      radius: Math.min(calculateThermalRadius(energyJoules, BLAST_CONSTANTS.THERMAL.VAPORIZATION), fireballRadius * 1.2),
      thermalFluence: BLAST_CONSTANTS.THERMAL.VAPORIZATION,
      description: 'Vaporization Zone',
      effect: 'Complete vaporization of all organic and most inorganic materials',
      temperature: `>${fireballTemp}K (>${fireballTemp - 273}°C)`
    },
    thirdDegreeBurns: {
      radius: calculateThermalRadius(energyJoules, BLAST_CONSTANTS.THERMAL.THIRD_DEGREE_BURNS),
      thermalFluence: BLAST_CONSTANTS.THERMAL.THIRD_DEGREE_BURNS,
      description: 'Third-Degree Burns',
      effect: 'Severe burns through all skin layers, often fatal without treatment',
      exposureTime: '1-2 seconds'
    },
    secondDegreeBurns: {
      radius: calculateThermalRadius(energyJoules, BLAST_CONSTANTS.THERMAL.SECOND_DEGREE_BURNS),
      thermalFluence: BLAST_CONSTANTS.THERMAL.SECOND_DEGREE_BURNS,
      description: 'Second-Degree Burns',
      effect: 'Painful burns, blistering, requires medical treatment',
      exposureTime: '2-3 seconds'
    },
    ignitionZone: {
      radius: calculateThermalRadius(energyJoules, BLAST_CONSTANTS.THERMAL.IGNITION),
      thermalFluence: BLAST_CONSTANTS.THERMAL.IGNITION,
      description: 'Fire Ignition Zone',
      effect: 'Ignition of paper, wood, fabric, and other flammable materials',
      secondaryEffect: 'Mass fires and firestorms possible in urban areas'
    },
    firstDegreeBurns: {
      radius: calculateThermalRadius(energyJoules, BLAST_CONSTANTS.THERMAL.FIRST_DEGREE_BURNS),
      thermalFluence: BLAST_CONSTANTS.THERMAL.FIRST_DEGREE_BURNS,
      description: 'First-Degree Burns',
      effect: 'Sunburn-like effects, temporary pain and redness',
      exposureTime: '3-5 seconds'
    }
  };
  
  // Calculate ejecta distribution
  const ejectaDistribution = calculateEjectaDistribution(craterRadiusKm, energyJoules);
  
  // Calculate maximum affected radius
  const maxRadius = Math.max(
    blastZones.glassBreakage.radius,
    thermalEffects.firstDegreeBurns.radius,
    ejectaDistribution.dustAndVapor.radius
  );
  
  // Calculate total affected area
  const affectedAreaKm2 = Math.PI * Math.pow(maxRadius, 2);
  
  // Calculate casualty estimates (simplified)
  const casualtyZones = calculateCasualtyEstimates(blastZones, thermalEffects);
  
  return {
    energyYield: {
      joules: energyJoules,
      megatons: yieldMegatons,
      kilotons: yieldKilotons,
      comparison: getEnergyComparison(yieldMegatons)
    },
    fireball: {
      radius: fireballRadius,
      diameter: fireballRadius * 2,
      duration: fireballDuration,
      temperature: fireballTemp,
      temperatureCelsius: fireballTemp - 273.15,
      description: 'Initial fireball - Everything vaporized instantly',
      brightness: 'Brighter than the sun'
    },
    mushroomCloud: mushroomCloud,
    blastEffects: blastZones,
    thermalRadiation: thermalEffects,
    ejectaDistribution: ejectaDistribution,
    impactZoneSummary: {
      maxAffectedRadius: maxRadius,
      totalAffectedArea: affectedAreaKm2,
      areaUnit: 'km²',
      impactType: impactType,
      note: 'Actual effects vary with terrain, weather, and target characteristics'
    },
    casualtyEstimates: casualtyZones,
    environmentalEffects: calculateEnvironmentalEffects(energyJoules, maxRadius, yieldMegatons)
  };
}

/**
 * Calculate casualty estimates for different zones
 * @param {object} blastZones - Blast effect zones
 * @param {object} thermalEffects - Thermal effect zones
 * @returns {object} Casualty estimates
 */
function calculateCasualtyEstimates(blastZones, thermalEffects) {
  const totalDestructionArea = Math.PI * Math.pow(blastZones.totalDestruction.radius, 2);
  const severeArea = Math.PI * Math.pow(blastZones.severeBlastDamage.radius, 2) - totalDestructionArea;
  const moderateArea = Math.PI * Math.pow(blastZones.moderateBlastDamage.radius, 2) - severeArea - totalDestructionArea;
  
  return {
    note: 'Casualty estimates are highly dependent on population density, time of day, building quality, and warning time',
    nearCertainFatality: {
      area: totalDestructionArea,
      description: 'Near-certain fatality zone (95-100% without deep shelter)',
      radius: blastZones.totalDestruction.radius
    },
    highCasualty: {
      area: severeArea,
      description: 'High casualty zone (80-95% without shelter)',
      radius: blastZones.severeBlastDamage.radius
    },
    moderateCasualty: {
      area: moderateArea,
      description: 'Moderate casualty zone (30-80% injuries/fatalities)',
      radius: blastZones.moderateBlastDamage.radius
    },
    populationDensityFactors: {
      majorCity: '5,000-15,000 per km²',
      urbanArea: '1,000-5,000 per km²',
      suburban: '200-1,000 per km²',
      rural: '10-200 per km²'
    }
  };
}

/**
 * Calculate environmental effects
 * @param {number} energyJoules - Impact energy
 * @param {number} maxRadius - Maximum affected radius
 * @param {number} megatons - Yield in megatons
 * @returns {object} Environmental effects
 */
function calculateEnvironmentalEffects(energyJoules, maxRadius, megatons) {
  const effects = {
    atmosphericShockwave: {
      radius: maxRadius * 3,
      description: 'Atmospheric pressure wave detectable globally',
      effect: 'Detectable on seismographs worldwide',
      duration: 'Hours'
    },
    dustAndDebris: {
      radius: maxRadius * 10,
      description: 'Dust cloud and airborne debris',
      effect: 'Reduced visibility, respiratory hazards, temperature drop',
      duration: megatons > 1000 ? 'Years' : megatons > 100 ? 'Months' : 'Weeks',
      particulateLoad: `${Math.round(megatons * 10)} million tons`
    }
  };
  
  // Climate effects for large impacts
  if (megatons >= 10000) {
    effects.climateImpact = {
      severity: 'EXTINCTION-LEVEL',
      type: 'Impact Winter',
      temperatureDrop: '15-30°C globally',
      duration: 'Years to decades',
      sunlightReduction: '90-99%',
      description: 'Prolonged darkness, mass extinction, collapse of food chains'
    };
  } else if (megatons >= 1000) {
    effects.climateImpact = {
      severity: 'CATASTROPHIC',
      type: 'Nuclear Winter Effect',
      temperatureDrop: '8-15°C globally',
      duration: 'Months to years',
      sunlightReduction: '50-90%',
      description: 'Global crop failures, mass starvation, ecosystem collapse'
    };
  } else if (megatons >= 100) {
    effects.climateImpact = {
      severity: 'SEVERE',
      type: 'Regional Climate Disruption',
      temperatureDrop: '3-8°C regionally',
      duration: 'Weeks to months',
      sunlightReduction: '20-50% regionally',
      description: 'Regional agricultural failures, significant climate disruption'
    };
  }
  
  // Ozone depletion for large impacts
  if (megatons >= 100) {
    effects.ozoneDepletion = {
      severity: megatons >= 1000 ? 'Severe (50-70%)' : 'Moderate (20-50%)',
      mechanism: 'Nitrogen oxides from impact shock heating',
      effect: 'Increased UV radiation, damage to ecosystems',
      duration: 'Years to decades',
      recovery: megatons >= 1000 ? '50+ years' : '10-20 years'
    };
  }
  
  // Acid rain
  if (megatons >= 10) {
    effects.acidRain = {
      radius: maxRadius * 50,
      pH: megatons >= 1000 ? '2.5-3.5' : '3.5-4.5',
      description: 'Nitric and sulfuric acid formation',
      effect: 'Widespread environmental damage, water contamination',
      duration: 'Months'
    };
  }
  
  return effects;
}

/**
 * Get energy comparison reference
 * @param {number} megatons - Energy in megatons
 * @returns {string} Comparison description
 */
function getEnergyComparison(megatons) {
  if (megatons >= 100000000) {
    return `${(megatons/1000000).toFixed(0)} million megatons - Planetary-scale devastation`;
  } else if (megatons >= 1000000) {
    return `${(megatons/1000000).toFixed(1)} million megatons - Mass extinction event (K-T boundary: ~100M MT)`;
  } else if (megatons >= 100000) {
    return `${(megatons/1000).toFixed(0)} thousand megatons - Continental destruction`;
  } else if (megatons >= 10000) {
    return `${(megatons/1000).toFixed(1)} thousand megatons - Multi-continental catastrophe`;
  } else if (megatons >= 1000) {
    return `${megatons.toFixed(0)} megatons - Regional extinction-level`;
  } else if (megatons >= 100) {
    return `${megatons.toFixed(0)} megatons - Devastating regional impact`;
  } else if (megatons >= 50) {
    return `${megatons.toFixed(1)} megatons - Larger than Tsar Bomba (50 MT, largest nuclear test)`;
  } else if (megatons >= 15) {
    return `${megatons.toFixed(1)} megatons - Modern strategic nuclear weapon range`;
  } else if (megatons >= 1) {
    return `${megatons.toFixed(2)} megatons - Large thermonuclear weapon`;
  } else if (megatons >= 0.1) {
    return `${(megatons * 1000).toFixed(0)} kilotons - Tactical nuclear weapon`;
  } else if (megatons >= 0.015) {
    return `${(megatons * 1000).toFixed(1)} kilotons - Hiroshima bomb: 15 KT`;
  } else {
    return `${(megatons * 1000).toFixed(2)} kilotons - Small tactical weapon`;
  }
}

/**
 * Generate evacuation zones based on blast effects
 * @param {object} blastEffects - Complete blast effects data
 * @returns {object} Evacuation zone recommendations
 */
function generateEvacuationZones(blastEffects) {
  const zones = {
    redZone: {
      radius: blastEffects.blastEffects.moderateBlastDamage.radius,
      priority: 'IMMEDIATE - CRITICAL',
      timeframe: 'Evacuate immediately if possible',
      description: 'Unsurvivable without deep underground shelter',
      actions: [
        'Complete evacuation mandatory',
        'No survival expected above ground',
        'Emergency services cannot operate',
        'All infrastructure will be destroyed'
      ],
      color: '#FF0000'
    },
    orangeZone: {
      radius: blastEffects.blastEffects.lightBlastDamage.radius,
      priority: 'URGENT - HIGH',
      timeframe: 'Evacuate within hours',
      description: 'Severe damage expected, high casualty risk',
      actions: [
        'Immediate evacuation strongly recommended',
        'Seek underground shelter if evacuation impossible',
        'Expect major injuries and fatalities',
        'Infrastructure severely compromised'
      ],
      color: '#FF8800'
    },
    yellowZone: {
      radius: blastEffects.blastEffects.minorDamage.radius,
      priority: 'MODERATE',
      timeframe: 'Evacuate within 24 hours',
      description: 'Significant damage, injuries likely',
      actions: [
        'Evacuation advised',
        'Shelter in place if evacuation not feasible',
        'Stay away from windows',
        'Prepare for extended power/water outages'
      ],
      color: '#FFFF00'
    },
    greenZone: {
      radius: blastEffects.blastEffects.glassBreakage.radius,
      priority: 'LOW - ADVISORY',
      timeframe: 'Prepare and monitor',
      description: 'Minor damage possible',
      actions: [
        'Stay indoors during impact',
        'Stay away from windows',
        'Prepare emergency supplies',
        'Monitor emergency broadcasts'
      ],
      color: '#00FF00'
    },
    blueZone: {
      radius: blastEffects.impactZoneSummary.maxAffectedRadius,
      priority: 'AWARENESS',
      timeframe: 'Stay informed',
      description: 'Possible indirect effects',
      actions: [
        'Monitor news and emergency channels',
        'Be prepared for dust/smoke',
        'Possible atmospheric effects',
        'Minor disruptions possible'
      ],
      color: '#0088FF'
    }
  };
  
  return zones;
}

/**
 * Generate comprehensive warnings
 * @param {object} blastEffects - Blast effects data
 * @param {object} location - Geographic location data
 * @returns {array} Array of warnings
 */
function generateBlastWarnings(blastEffects, location) {
  const warnings = [];
  const maxRadius = blastEffects.impactZoneSummary.maxAffectedRadius;
  const megatons = blastEffects.energyYield.megatons;
  
  // Critical blast warnings
  if (maxRadius >= 100) {
    warnings.push({
      severity: 'EXTREME',
      category: 'BLAST',
      message: `EXTREME BLAST HAZARD: Destructive effects extending ${maxRadius.toFixed(0)} km. Continental-scale devastation expected.`,
      priority: 1
    });
  } else if (maxRadius >= 50) {
    warnings.push({
      severity: 'CRITICAL',
      category: 'BLAST',
      message: `CRITICAL BLAST HAZARD: Severe blast effects extending ${maxRadius.toFixed(0)} km. Regional devastation expected.`,
      priority: 1
    });
  } else if (maxRadius >= 10) {
    warnings.push({
      severity: 'HIGH',
      category: 'BLAST',
      message: `HIGH BLAST HAZARD: Major blast effects extending ${maxRadius.toFixed(0)} km. Widespread destruction in impact zone.`,
      priority: 2
    });
  }
  
  // Thermal radiation warnings
  if (blastEffects.thermalRadiation.thirdDegreeBurns.radius >= 10) {
    warnings.push({
      severity: 'CRITICAL',
      category: 'THERMAL',
      message: `SEVERE THERMAL RADIATION: Third-degree burns possible up to ${blastEffects.thermalRadiation.thirdDegreeBurns.radius.toFixed(1)} km. Widespread fires expected.`,
      priority: 1
    });
  } else if (blastEffects.thermalRadiation.ignitionZone.radius >= 5) {
    warnings.push({
      severity: 'HIGH',
      category: 'THERMAL',
      message: `FIRE HAZARD: Mass ignition of flammable materials up to ${blastEffects.thermalRadiation.ignitionZone.radius.toFixed(1)} km. Firestorms possible.`,
      priority: 2
    });
  }
  
  // Ejecta warnings
  if (blastEffects.ejectaDistribution.continuousEjectaBlanket.radius >= 5) {
    warnings.push({
      severity: 'CRITICAL',
      category: 'EJECTA',
      message: `MASSIVE EJECTA BLANKET: Complete burial expected within ${blastEffects.ejectaDistribution.continuousEjectaBlanket.radius.toFixed(1)} km. Average depth: ${(blastEffects.ejectaDistribution.continuousEjectaBlanket.thickness * 1000).toFixed(0)} meters.`,
      priority: 1
    });
  }
  
  if (blastEffects.ejectaDistribution.discontinuousEjecta.radius >= 20) {
    warnings.push({
      severity: 'HIGH',
      category: 'EJECTA',
      message: `BALLISTIC PROJECTILES: Boulder-sized debris impacts expected up to ${blastEffects.ejectaDistribution.discontinuousEjecta.radius.toFixed(0)} km from impact.`,
      priority: 2
    });
  }
  
  // Climate/environmental warnings
  if (blastEffects.environmentalEffects.climateImpact) {
    warnings.push({
      severity: 'EXTREME',
      category: 'CLIMATE',
      message: `${blastEffects.environmentalEffects.climateImpact.severity} CLIMATE IMPACT: ${blastEffects.environmentalEffects.climateImpact.description}`,
      priority: 1
    });
  }
  
  if (blastEffects.environmentalEffects.ozoneDepletion) {
    warnings.push({
      severity: 'HIGH',
      category: 'ENVIRONMENTAL',
      message: `OZONE DEPLETION: ${blastEffects.environmentalEffects.ozoneDepletion.severity} ozone layer destruction. Increased UV radiation for ${blastEffects.environmentalEffects.ozoneDepletion.duration}.`,
      priority: 2
    });
  }
  
  // Mushroom cloud warning
  if (blastEffects.mushroomCloud && blastEffects.mushroomCloud.reachesStratosphere) {
    warnings.push({
      severity: 'HIGH',
      category: 'ATMOSPHERIC',
      message: `STRATOSPHERIC INJECTION: Mushroom cloud reaching ${blastEffects.mushroomCloud.height.toFixed(1)} km altitude. Global atmospheric effects expected.`,
      priority: 2
    });
  }
  
  // Population-specific warnings
  if (location?.riskLevel === 'CATASTROPHIC' || location?.riskLevel === 'CRITICAL') {
    warnings.push({
      severity: 'CRITICAL',
      category: 'POPULATION',
      message: 'MASS CASUALTY EVENT: Impact in populated area. Millions of casualties anticipated. Immediate large-scale evacuation required.',
      priority: 1
    });
  }
  
  // General advisory
  warnings.push({
    severity: 'INFO',
    category: 'ADVISORY',
    message: 'Seek underground shelter. Stay away from windows. Follow emergency broadcast instructions. Prepare for extended disruption of all services.',
    priority: 3
  });
  
  // Sort by priority
  return warnings.sort((a, b) => a.priority - b.priority);
}

/**
 * Main function to add blast radius data to impact calculations
 * @param {object} impactData - Impact data from customHitHandler
 * @returns {object} Enhanced data with blast radius calculations
 */
function addBlastRadiusData(impactData) {
  try {
    const kineticEnergy = impactData.calculations?.kineticEnergy?.value;
    const craterRadius = impactData.calculations?.estimatedCrater?.radius;
    const location = impactData.geographicImpactData?.geographicRisk;
    
    if (!kineticEnergy) {
      return {
        ...impactData,
        blastRadiusData: {
          error: 'Kinetic energy not available for blast calculations'
        }
      };
    }
    
    if (!craterRadius) {
      return {
        ...impactData,
        blastRadiusData: {
          error: 'Crater radius not available for blast calculations'
        }
      };
    }
    
    // Convert crater radius from meters to kilometers
    const craterRadiusKm = craterRadius / 1000;
    
    // Determine impact type
    const isOceanImpact = location?.primaryRegion === 'Ocean';
    const impactType = isOceanImpact ? 'shallow_water' : 'surface';
    
    // Calculate all blast effects
    const blastEffects = calculateAllBlastEffects(kineticEnergy, craterRadiusKm, impactType);
    
    // Generate evacuation zones
    const evacuationZones = generateEvacuationZones(blastEffects);
    
    // Generate warnings
    const warnings = generateBlastWarnings(blastEffects, location);
    
    // Calculate some additional derived metrics
    const totalDestructionArea = Math.PI * Math.pow(blastEffects.blastEffects.totalDestruction.radius, 2);
    const severeArea = Math.PI * Math.pow(blastEffects.blastEffects.severeBlastDamage.radius, 2);
    
    return {
      ...impactData,
      blastRadiusData: {
        ...blastEffects,
        evacuationZones: evacuationZones,
        warnings: warnings,
        impactClassification: {
          impactType: impactType,
          category: getImpactCategory(blastEffects.energyYield.megatons),
          totalDestructionArea: totalDestructionArea,
          severeDestructionArea: severeArea,
          comparableEvent: getComparableHistoricalEvent(blastEffects.energyYield.megatons)
        },
        calculationMetadata: {
          method: 'Scaled nuclear weapon equations adapted for kinetic impactors',
          assumptions: [
            'Standard atmosphere (sea level)',
            'Flat terrain',
            'Clear weather conditions',
            'Instantaneous energy release'
          ],
          uncertaintyFactors: [
            'Actual terrain affects blast propagation',
            'Weather conditions affect thermal radiation',
            'Building construction quality varies',
            'Population density varies significantly'
          ],
          references: [
            'Glasstone & Dolan (1977) - The Effects of Nuclear Weapons',
            'Collins et al. (2005) - Earth Impact Effects Program',
            'Toon et al. (1997) - Environmental perturbations caused by impacts'
          ]
        }
      }
    };
  } catch (error) {
    console.error('Error calculating blast radius data:', error);
    return {
      ...impactData,
      blastRadiusData: {
        error: 'Failed to calculate blast radius data',
        details: error.message
      }
    };
  }
}

/**
 * Get impact category based on energy
 * @param {number} megatons - Energy in megatons
 * @returns {string} Category
 */
function getImpactCategory(megatons) {
  if (megatons >= 1000000) return 'PLANETARY EXTINCTION';
  if (megatons >= 100000) return 'MASS EXTINCTION';
  if (megatons >= 10000) return 'CONTINENTAL DEVASTATION';
  if (megatons >= 1000) return 'REGIONAL EXTINCTION';
  if (megatons >= 100) return 'REGIONAL CATASTROPHE';
  if (megatons >= 10) return 'MAJOR REGIONAL DISASTER';
  if (megatons >= 1) return 'SIGNIFICANT LOCAL DISASTER';
  if (megatons >= 0.1) return 'LOCAL DISASTER';
  return 'LOCALIZED EVENT';
}

/**
 * Get comparable historical event
 * @param {number} megatons - Energy in megatons
 * @returns {object} Comparable event
 */
function getComparableHistoricalEvent(megatons) {
  const events = [
    { threshold: 100000000, name: 'Chicxulub Impact', megatons: 100000000, year: '66 million years ago', description: 'Dinosaur extinction event' },
    { threshold: 1000000, name: 'Large asteroid impact', megatons: 10000000, year: 'Prehistoric', description: 'Mass extinction level' },
    { threshold: 100000, name: 'Tunguska-class × 10000', megatons: 150000, year: 'Hypothetical', description: 'Continental devastation' },
    { threshold: 1000, name: 'Large comet impact', megatons: 5000, year: 'Hypothetical', description: 'Regional extinction' },
    { threshold: 100, name: 'Meteor Crater × 100', megatons: 300, year: 'Hypothetical', description: 'Multi-state destruction' },
    { threshold: 50, name: 'Tsar Bomba', megatons: 50, year: 1961, description: 'Largest nuclear weapon ever tested' },
    { threshold: 10, name: 'Large strategic warhead', megatons: 25, year: 'Cold War era', description: 'City-destroyer weapon' },
    { threshold: 1, name: 'Typical thermonuclear weapon', megatons: 5, year: 'Modern', description: 'Strategic nuclear weapon' },
    { threshold: 0.1, name: 'Tactical nuclear weapon', megatons: 0.3, year: 'Modern', description: 'Battlefield weapon' },
    { threshold: 0.01, name: 'Hiroshima bomb', megatons: 0.015, year: 1945, description: 'First combat atomic weapon' }
  ];
  
  for (const event of events) {
    if (megatons >= event.threshold) {
      return {
        name: event.name,
        energy: event.megatons,
        year: event.year,
        description: event.description,
        comparison: megatons > event.megatons ? 
          `${(megatons / event.megatons).toFixed(1)}× more powerful` : 
          `${(event.megatons / megatons).toFixed(1)}× less powerful`
      };
    }
  }
  
  return {
    name: 'Small conventional explosion',
    energy: 0.001,
    year: 'Common',
    description: 'Small explosive device',
    comparison: `${(megatons / 0.001).toFixed(0)}× more powerful`
  };
}

// Export functions
module.exports = {
  calculateBlastRadius,
  calculateThermalRadius,
  calculateFireballRadius,
  calculateAllBlastEffects,
  addBlastRadiusData,
  generateEvacuationZones,
  generateBlastWarnings,
  BLAST_CONSTANTS
};