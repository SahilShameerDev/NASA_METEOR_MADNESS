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

// Import the new earthquake calculator
const { addEarthquakeData } = require('../services/calculate_earthquake');

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

        // Prepare comprehensive response
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
                    note: 'Energy equivalent in megatons of TNT'
                },
                estimatedCrater: {
                    diameter: craterDiameter,
                    radius: craterRadius,
                    unit: 'meters'
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
        customHitData = addEarthquakeData(customHitData);

        // Return the processed data with all calculations including earthquake data
        res.json({ 
            success: true,
            message: 'Custom hit data processed successfully with impact and earthquake calculations', 
            data: customHitData 
        });
    } catch (error) {
        console.error('Error processing custom hit data:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to process custom hit data', 
            details: error.message 
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