/* 
Custom Hit Handler --> Values to control the custom hit endpoint
        1. date (YYYY-MM-DD)
        2. lat (latitude in decimal degrees)
        3. long (longitude in decimal degrees)
        4. velocity (in km/s)
        5. diameter (in meters)
        6. mass (optional - will be calculated if not provided)
        7. density (in kg/m³, default: 3000 for stony asteroids)
        8. approach (in lunar distances)
        9. miss (in km)
        10. hazard (boolean true/false)
*/

const { 
    calculateMass, 
    calculateKineticEnergy, 
    calculateCraterDiameter, 
    estimateImpactProbability,
    CONSTANTS 
} = require('../services/calculate_hit');

const { assessGeographicRisk } = require('../services/calculate_lat_and_long');

// Import the earthquake calculator
const { addEarthquakeData } = require('../services/calculate_earthquake');

// Import the blast radius calculator
const { addBlastRadiusData } = require('../services/calculate_blast_radius');

// Import the mitigation strategies calculator
const { addMitigationStrategies } = require('../services/mitigation_strategies');

module.exports.getCustomHit = async (req, res) => {
    try {
        const {
            date,
            lat,
            long,
            velocity,      // in km/s
            diameter,      // in meters
            mass,          // in kg (optional)
            density,       // in kg/m³ (optional, default: 3000)
            approach,      // in lunar distances
            miss,          // in km
            hazard         // boolean
        } = req.body;

        // Validate required input
        if (!date || lat === undefined || long === undefined || !velocity || !diameter || miss === undefined) {
            return res.status(400).json({ 
                error: 'Required fields: date, lat, long, velocity, diameter, miss',
                requiredFields: {
                    date: 'YYYY-MM-DD format',
                    lat: 'latitude in decimal degrees (-90 to 90)',
                    long: 'longitude in decimal degrees (-180 to 180)',
                    velocity: 'velocity in km/s',
                    diameter: 'diameter in meters',
                    miss: 'miss distance in km'
                },
                optionalFields: {
                    mass: 'mass in kg (calculated if not provided)',
                    density: 'density in kg/m³ (default: 3000)',
                    approach: 'approach distance in lunar distances',
                    hazard: 'boolean (default: false)'
                }
            });
        }

        // Parse and validate numeric inputs
        const parsedLat = parseFloat(lat);
        const parsedLong = parseFloat(long);
        const parsedVelocity = parseFloat(velocity);
        const parsedDiameter = parseFloat(diameter);
        const parsedMiss = parseFloat(miss);
        const parsedDensity = density ? parseFloat(density) : CONSTANTS.DEFAULT_DENSITY;
        const parsedApproach = approach ? parseFloat(approach) : null;
        const isHazardous = hazard === true || hazard === 'true';

        // Validate ranges
        if (parsedLat < -90 || parsedLat > 90) {
            return res.status(400).json({ error: 'Latitude must be between -90 and 90' });
        }
        if (parsedLong < -180 || parsedLong > 180) {
            return res.status(400).json({ error: 'Longitude must be between -180 and 180' });
        }
        if (parsedVelocity <= 0 || parsedDiameter <= 0 || parsedMiss < 0) {
            return res.status(400).json({ error: 'Velocity, diameter, and miss distance must be positive' });
        }

        // Calculate mass if not provided
        const calculatedMass = mass ? parseFloat(mass) : calculateMass(parsedDiameter, parsedDensity);

        // Convert velocity from km/s to m/s
        const velocityMS = parsedVelocity * 1000;

        // Perform impact calculations
        const kineticEnergy = calculateKineticEnergy(calculatedMass, velocityMS);
        const craterDiameter = calculateCraterDiameter(kineticEnergy);
        const craterRadius = craterDiameter / 2;
        const impactProbability = estimateImpactProbability(parsedMiss, parsedDiameter / 1000);

        // Determine risk level
        const riskLevel = getRiskLevel(impactProbability, isHazardous);

        // Calculate geographic risk
        const craterRadiusKm = craterRadius / 1000;
        const impactLocation = {
            estimatedImpactPoint: {
                latitude: parsedLat,
                longitude: parsedLong,
                confidence: 'user-provided',
                note: 'Custom impact location provided by user'
            },
            impactTimestamp: new Date(date).toISOString(),
            coordinateSystem: 'WGS84'
        };

        const geographicRisk = assessGeographicRisk(impactLocation, craterRadiusKm);

        // Prepare comprehensive response with basic calculations
        let customHitData = {
            input: {
                date: date,
                location: {
                    latitude: parsedLat,
                    longitude: parsedLong
                },
                velocity: {
                    kilometersPerSecond: parsedVelocity,
                    kilometersPerHour: parsedVelocity * 3600,
                    metersPerSecond: velocityMS
                },
                size: {
                    diameter: parsedDiameter,
                    mass: calculatedMass,
                    density: parsedDensity,
                    unit: 'meters'
                },
                approach: parsedApproach ? {
                    lunarDistances: parsedApproach,
                    kilometers: parsedApproach * 384400 // 1 LD = 384,400 km
                } : null,
                missDistance: {
                    kilometers: parsedMiss,
                    earthRadii: parsedMiss / 6371
                },
                isPotentiallyHazardous: isHazardous
            },
            calculations: {
                mass: {
                    value: calculatedMass,
                    unit: 'kg',
                    source: mass ? 'user-provided' : 'calculated'
                },
                kineticEnergy: {
                    value: kineticEnergy,
                    unit: 'Joules',
                    megatons: kineticEnergy / 4.184e15,
                    kilotons: kineticEnergy / 4.184e12,
                    note: 'Energy equivalent in TNT explosive yield'
                },
                estimatedCrater: {
                    diameter: craterDiameter,
                    radius: craterRadius,
                    unit: 'meters',
                    radiusKm: craterRadiusKm
                },
                impactProbability: {
                    value: impactProbability,
                    percentage: (impactProbability * 100).toFixed(8),
                    riskLevel: riskLevel
                }
            },
            geographicImpactData: {
                impactLocation: impactLocation,
                geographicRisk: geographicRisk
            },
            metadata: {
                calculatedAt: new Date().toISOString(),
                source: 'custom-user-input',
                note: 'Calculations based on user-provided custom asteroid data'
            }
        };

        // Add earthquake data calculations
        console.log('Calculating earthquake effects...');
        customHitData = addEarthquakeData(customHitData);

        // Add blast radius calculations
        console.log('Calculating blast radius effects...');
        customHitData = addBlastRadiusData(customHitData);

        // Add mitigation strategies
        console.log('Calculating mitigation strategies...');
        customHitData = addMitigationStrategies(customHitData);

        // Add comprehensive summary
        customHitData.impactSummary = generateImpactSummary(customHitData);

        // Return the complete processed data with all calculations
        res.json({ 
            success: true,
            message: 'Custom hit data processed successfully with complete impact analysis', 
            data: customHitData,
            dataStructure: {
                input: 'User-provided asteroid parameters',
                calculations: 'Basic impact physics (energy, crater)',
                geographicImpactData: 'Geographic location and risk assessment',
                earthquakeData: 'Seismic magnitude and effects',
                blastRadiusData: 'Blast wave, thermal, and ejecta effects',
                mitigationData: 'Planetary defense and prevention strategies',
                impactSummary: 'Overall impact assessment and recommendations'
            }
        });
    } catch (error) {
        console.error('Error processing custom hit data:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to process custom hit data', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Determine risk level based on impact probability and hazard status
 * @param {number} probability - Impact probability (0-1)
 * @param {boolean} isPotentiallyHazardous - Hazard classification
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
 * Generate comprehensive impact summary
 * @param {object} impactData - Complete impact data
 * @returns {object} Impact summary
 */
function generateImpactSummary(impactData) {
    const energy = impactData.calculations?.kineticEnergy?.megatons || 0;
    const earthquakeMag = impactData.earthquakeData?.seismicMagnitude?.primaryMagnitude || 0;
    const maxBlastRadius = impactData.blastRadiusData?.impactZoneSummary?.maxAffectedRadius || 0;
    const location = impactData.geographicImpactData?.geographicRisk;
    
    // Determine overall threat level
    let overallThreat = 'MINIMAL';
    if (energy >= 1000 || earthquakeMag >= 9.0) {
        overallThreat = 'EXTINCTION-LEVEL';
    } else if (energy >= 100 || earthquakeMag >= 8.0) {
        overallThreat = 'CATASTROPHIC';
    } else if (energy >= 10 || earthquakeMag >= 7.0) {
        overallThreat = 'SEVERE';
    } else if (energy >= 1 || earthquakeMag >= 6.0) {
        overallThreat = 'MAJOR';
    } else if (energy >= 0.1 || earthquakeMag >= 5.0) {
        overallThreat = 'MODERATE';
    } else if (energy >= 0.01) {
        overallThreat = 'MINOR';
    }
    
    // Primary effects
    const primaryEffects = [];
    if (maxBlastRadius > 0) {
        primaryEffects.push(`Blast effects extending ${maxBlastRadius.toFixed(1)} km`);
    }
    if (earthquakeMag > 0) {
        primaryEffects.push(`Magnitude ${earthquakeMag} seismic event`);
    }
    if (impactData.blastRadiusData?.thermalRadiation?.thirdDegreeBurns?.radius > 0) {
        primaryEffects.push(`Thermal radiation up to ${impactData.blastRadiusData.thermalRadiation.thirdDegreeBurns.radius.toFixed(1)} km`);
    }
    if (impactData.calculations?.estimatedCrater?.radiusKm) {
        primaryEffects.push(`Impact crater: ${impactData.calculations.estimatedCrater.radiusKm.toFixed(2)} km radius`);
    }
    
    // Secondary effects
    const secondaryEffects = [];
    if (impactData.earthquakeData?.tsunamiWarning) {
        secondaryEffects.push('Tsunami generation likely');
    }
    if (impactData.blastRadiusData?.environmentalEffects?.climateImpact) {
        secondaryEffects.push(impactData.blastRadiusData.environmentalEffects.climateImpact.type);
    }
    if (impactData.earthquakeData?.aftershockPrediction) {
        secondaryEffects.push(`${impactData.earthquakeData.aftershockPrediction.expectedAftershocksNext24h} aftershocks expected`);
    }
    if (impactData.blastRadiusData?.ejectaDistribution?.continuousEjectaBlanket) {
        secondaryEffects.push(`Ejecta blanket extending ${impactData.blastRadiusData.ejectaDistribution.continuousEjectaBlanket.radius.toFixed(1)} km`);
    }
    if (impactData.blastRadiusData?.environmentalEffects?.ozoneDepletion) {
        secondaryEffects.push('Ozone layer depletion');
    }
    
    // Recommended actions
    const recommendedActions = [];
    if (overallThreat === 'EXTINCTION-LEVEL' || overallThreat === 'CATASTROPHIC') {
        recommendedActions.push('GLOBAL EMERGENCY - Seek deep underground shelter immediately');
        recommendedActions.push('Prepare for long-term survival scenario');
        recommendedActions.push('Follow government evacuation orders');
        recommendedActions.push('Stock supplies for extended period (months to years)');
    } else if (overallThreat === 'SEVERE' || overallThreat === 'MAJOR') {
        recommendedActions.push('IMMEDIATE EVACUATION of impact zone required');
        recommendedActions.push('Seek underground shelter if evacuation impossible');
        recommendedActions.push('Prepare for extended power/water/communications outages');
        recommendedActions.push('Stock emergency supplies for weeks');
    } else if (overallThreat === 'MODERATE') {
        recommendedActions.push('Monitor emergency broadcasts continuously');
        recommendedActions.push('Prepare evacuation plan and emergency kit');
        recommendedActions.push('Stay indoors during impact, away from windows');
        recommendedActions.push('Have several days of supplies ready');
    } else {
        recommendedActions.push('Stay informed through official channels');
        recommendedActions.push('Monitor situation updates');
        recommendedActions.push('No immediate action required');
    }
    
    // Time-sensitive warnings
    const timeframe = getTimeframe(impactData.input?.date);
    
    // Affected population estimate
    let populationRisk = 'Unknown';
    if (location?.riskLevel === 'CATASTROPHIC') {
        populationRisk = 'Major population centers at extreme risk';
    } else if (location?.riskLevel === 'CRITICAL') {
        populationRisk = 'Significant population at high risk';
    } else if (location?.riskLevel === 'HIGH') {
        populationRisk = 'Populated areas at moderate risk';
    } else if (location?.riskLevel === 'MODERATE') {
        populationRisk = 'Low population density area';
    } else {
        populationRisk = 'Remote area, minimal population risk';
    }
    
    // Add mitigation strategy summary
    let mitigationSummary = null;
    if (impactData.mitigationData && !impactData.mitigationData.error) {
        mitigationSummary = {
            recommendedApproach: impactData.mitigationData.recommendedApproach,
            timeAvailable: impactData.mitigationData.timeAvailable,
            successProbability: impactData.mitigationData.successProbability,
            primaryStrategy: impactData.mitigationData.deflectionStrategies?.[0]?.method || 
                           impactData.mitigationData.civilDefenseStrategies?.[0]?.strategy || 'Evaluate options',
            keyRecommendation: impactData.mitigationData.keyRecommendations?.[0]?.action || 'Assess threat immediately'
        };
    }
    
    return {
        overallThreatLevel: overallThreat,
        impactScale: impactData.blastRadiusData?.impactClassification?.category || 'UNKNOWN',
        energyYield: `${energy.toFixed(4)} megatons TNT equivalent`,
        affectedRadius: `${maxBlastRadius.toFixed(1)} km maximum radius`,
        estimatedTimeToImpact: timeframe,
        primaryEffects: primaryEffects,
        secondaryEffects: secondaryEffects,
        recommendedActions: recommendedActions,
        populationAtRisk: populationRisk,
        geographicContext: location?.primaryRegion || 'Unknown',
        urgencyLevel: getUrgencyLevel(timeframe, overallThreat),
        keyMetrics: {
            energy: `${energy.toFixed(4)} MT`,
            earthquakeMagnitude: earthquakeMag > 0 ? earthquakeMag.toFixed(1) : 'N/A',
            maxBlastRadius: `${maxBlastRadius.toFixed(1)} km`,
            craterSize: `${impactData.calculations?.estimatedCrater?.radiusKm?.toFixed(2) || 0} km radius`,
            thermalRadius: `${impactData.blastRadiusData?.thermalRadiation?.thirdDegreeBurns?.radius?.toFixed(1) || 0} km`,
            fireballRadius: `${impactData.blastRadiusData?.fireball?.radius?.toFixed(2) || 0} km`
        },
        comparisonToKnownEvents: impactData.blastRadiusData?.impactClassification?.comparableEvent || null,
        criticalWarnings: getAllCriticalWarnings(impactData),
        evacuationZones: impactData.blastRadiusData?.evacuationZones || null,
        estimatedCasualties: impactData.blastRadiusData?.casualtyEstimates || null,
        mitigationStrategy: mitigationSummary
    };
}

/**
 * Get timeframe to impact
 * @param {string} dateString - Impact date
 * @returns {string} Timeframe description
 */
function getTimeframe(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        const impactDate = new Date(dateString);
        const now = new Date();
        const diffMs = impactDate - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMs < 0) {
            return 'Impact already occurred';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minutes`;
        } else if (diffHours < 24) {
            return `${diffHours} hours`;
        } else if (diffDays < 7) {
            return `${diffDays} days`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)} weeks`;
        } else if (diffDays < 365) {
            return `${Math.floor(diffDays / 30)} months`;
        } else {
            return `${Math.floor(diffDays / 365)} years`;
        }
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * Get urgency level based on timeframe and threat
 * @param {string} timeframe - Time to impact
 * @param {string} threatLevel - Overall threat level
 * @returns {string} Urgency level
 */
function getUrgencyLevel(timeframe, threatLevel) {
    const isImminent = timeframe.includes('minutes') || timeframe.includes('hours') || 
                       (timeframe.includes('days') && parseInt(timeframe) < 7);
    
    if (threatLevel === 'EXTINCTION-LEVEL' || threatLevel === 'CATASTROPHIC') {
        if (isImminent) return 'IMMEDIATE ACTION REQUIRED';
        return 'CRITICAL - PREPARE NOW';
    } else if (threatLevel === 'SEVERE' || threatLevel === 'MAJOR') {
        if (isImminent) return 'URGENT - ACT NOW';
        return 'HIGH - PREPARE IMMEDIATELY';
    } else if (threatLevel === 'MODERATE') {
        if (isImminent) return 'ELEVATED - TAKE PRECAUTIONS';
        return 'MODERATE - MONITOR SITUATION';
    } else {
        return 'LOW - STAY INFORMED';
    }
}

/**
 * Collect all critical warnings from different modules
 * @param {object} impactData - Complete impact data
 * @returns {array} Array of all critical warnings
 */
function getAllCriticalWarnings(impactData) {
    const allWarnings = [];
    
    // Earthquake warnings
    if (impactData.earthquakeData?.warnings) {
        impactData.earthquakeData.warnings.forEach(warning => {
            if (warning.severity === 'CRITICAL' || warning.severity === 'EXTREME') {
                allWarnings.push({
                    source: 'SEISMIC',
                    ...warning
                });
            }
        });
    }
    
    // Blast radius warnings
    if (impactData.blastRadiusData?.warnings) {
        impactData.blastRadiusData.warnings.forEach(warning => {
            if (warning.severity === 'CRITICAL' || warning.severity === 'EXTREME') {
                allWarnings.push({
                    source: 'BLAST',
                    ...warning
                });
            }
        });
    }
    
    // Tsunami warning
    if (impactData.earthquakeData?.tsunamiWarning) {
        allWarnings.push({
            source: 'TSUNAMI',
            severity: impactData.earthquakeData.tsunamiWarning.risk,
            category: 'TSUNAMI',
            message: impactData.earthquakeData.tsunamiWarning.message,
            details: impactData.earthquakeData.tsunamiWarning
        });
    }
    
    // Climate warning
    if (impactData.blastRadiusData?.environmentalEffects?.climateImpact) {
        const climate = impactData.blastRadiusData.environmentalEffects.climateImpact;
        allWarnings.push({
            source: 'CLIMATE',
            severity: climate.severity,
            category: 'ENVIRONMENTAL',
            message: `${climate.type}: ${climate.description}`,
            details: climate
        });
    }
    
    // Mitigation warnings (time-sensitive)
    if (impactData.mitigationData?.keyRecommendations) {
        const criticalRecs = impactData.mitigationData.keyRecommendations.filter(
            rec => rec.priority === 'CRITICAL'
        );
        criticalRecs.forEach(rec => {
            allWarnings.push({
                source: 'MITIGATION',
                severity: 'CRITICAL',
                category: 'PLANETARY_DEFENSE',
                message: rec.action,
                rationale: rec.rationale
            });
        });
    }
    
    return allWarnings;
}