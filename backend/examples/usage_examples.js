/**
 * Example Usage Scripts for NASA Meteoroid Impact Calculator API
 * Demonstrates how to use the geographic impact features
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// =============================================================================
// Example 1: Basic API Call
// =============================================================================
async function example1_BasicCall() {
  console.log('\n=== Example 1: Basic API Call ===\n');
  
  try {
    const response = await axios.get(`${API_BASE}/`, {
      params: {
        start_date: '2025-10-01',
        end_date: '2025-10-07'
      }
    });
    
    console.log(`Total NEOs detected: ${response.data.elementCount}`);
    console.log(`Hazardous objects: ${response.data.summary.hazardousCount}`);
    console.log(`Processing complete for ${response.data.processedDates.length} dates`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// =============================================================================
// Example 2: Extract Geographic Impact Data
// =============================================================================
async function example2_GeographicData() {
  console.log('\n=== Example 2: Geographic Impact Data ===\n');
  
  try {
    const response = await axios.get(`${API_BASE}/`);
    const firstNEO = response.data.processedDates[0].neos[0];
    
    console.log(`NEO: ${firstNEO.name}`);
    console.log(`Diameter: ${firstNEO.diameter.average.toFixed(2)} meters`);
    
    const geoData = firstNEO.geographicImpactData;
    
    if (geoData?.impactLocation?.estimatedImpactPoint) {
      const point = geoData.impactLocation.estimatedImpactPoint;
      console.log(`\nEstimated Impact Location:`);
      console.log(`  Latitude: ${point.latitude}°`);
      console.log(`  Longitude: ${point.longitude}°`);
      console.log(`  Confidence: ${point.confidence}`);
    }
    
    if (geoData?.geographicRisk) {
      const risk = geoData.geographicRisk;
      console.log(`\nGeographic Risk Assessment:`);
      console.log(`  Region: ${risk.primaryRegion}`);
      console.log(`  Continent: ${risk.continent}`);
      console.log(`  Crater Radius: ${risk.craterRadius.value} ${risk.craterRadius.unit}`);
      console.log(`  Affected Area: ${risk.estimatedAffectedArea.value.toFixed(2)} ${risk.estimatedAffectedArea.unit}`);
      console.log(`  Risk Level: ${risk.riskLevel}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// =============================================================================
// Example 3: Probability Map Visualization
// =============================================================================
async function example3_ProbabilityMap() {
  console.log('\n=== Example 3: Probability Map ===\n');
  
  try {
    const response = await axios.get(`${API_BASE}/`);
    const firstNEO = response.data.processedDates[0].neos[0];
    
    const probMap = firstNEO.geographicImpactData?.probabilityMap;
    
    if (probMap?.impactPoints && probMap.impactPoints.length > 0) {
      console.log(`NEO: ${firstNEO.name}`);
      console.log(`Samples: ${probMap.samples}`);
      console.log(`Uncertainty: ±${probMap.uncertaintyKm} km`);
      console.log(`\nFirst 5 Impact Points:`);
      
      probMap.impactPoints.slice(0, 5).forEach((point, idx) => {
        console.log(`  ${idx + 1}. Lat: ${point.latitude.toFixed(4)}°, Lon: ${point.longitude.toFixed(4)}°, Prob: ${(point.probability * 100).toFixed(2)}%`);
      });
      
      // Calculate center of probability distribution
      const avgLat = probMap.impactPoints.reduce((sum, p) => sum + p.latitude, 0) / probMap.impactPoints.length;
      const avgLon = probMap.impactPoints.reduce((sum, p) => sum + p.longitude, 0) / probMap.impactPoints.length;
      
      console.log(`\nDistribution Center: ${avgLat.toFixed(4)}°, ${avgLon.toFixed(4)}°`);
    } else {
      console.log('No probability map available (object passes too far from Earth)');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// =============================================================================
// Example 4: Find Most Dangerous Objects
// =============================================================================
async function example4_MostDangerous() {
  console.log('\n=== Example 4: Most Dangerous Objects ===\n');
  
  try {
    const response = await axios.get(`${API_BASE}/`, {
      params: {
        start_date: '2025-09-01',
        end_date: '2025-09-30'
      }
    });
    
    // Collect all NEOs with risk data
    const allNEOs = response.data.processedDates.flatMap(d => d.neos);
    
    // Sort by impact probability (descending)
    const sorted = allNEOs
      .filter(neo => neo.primaryApproach?.calculations?.impactProbability)
      .sort((a, b) => {
        const probA = a.primaryApproach.calculations.impactProbability.value;
        const probB = b.primaryApproach.calculations.impactProbability.value;
        return probB - probA;
      });
    
    console.log(`Top 5 Highest Impact Probability Objects:\n`);
    
    sorted.slice(0, 5).forEach((neo, idx) => {
      const calc = neo.primaryApproach.calculations;
      const geoRisk = neo.geographicImpactData?.geographicRisk;
      
      console.log(`${idx + 1}. ${neo.name}`);
      console.log(`   Diameter: ${neo.diameter.average.toFixed(1)}m`);
      console.log(`   Impact Probability: ${calc.impactProbability.percentage}%`);
      console.log(`   Risk Level: ${calc.impactProbability.riskLevel}`);
      console.log(`   Crater Diameter: ${(calc.estimatedCrater.diameter / 1000).toFixed(2)} km`);
      console.log(`   Energy: ${calc.kineticEnergy.megatons.toFixed(1)} MT`);
      
      if (geoRisk) {
        console.log(`   Region at Risk: ${geoRisk.primaryRegion}`);
        console.log(`   Regional Risk: ${geoRisk.riskLevel}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// =============================================================================
// Example 5: Regional Threat Analysis
// =============================================================================
async function example5_RegionalThreats() {
  console.log('\n=== Example 5: Regional Threat Analysis ===\n');
  
  try {
    const response = await axios.get(`${API_BASE}/`);
    
    // Group by region
    const regionThreats = {};
    
    response.data.processedDates.forEach(dateData => {
      dateData.neos.forEach(neo => {
        const region = neo.geographicImpactData?.geographicRisk?.primaryRegion;
        const riskLevel = neo.geographicImpactData?.geographicRisk?.riskLevel;
        
        if (region && riskLevel) {
          if (!regionThreats[region]) {
            regionThreats[region] = {
              count: 0,
              highRisk: 0,
              totalEnergy: 0
            };
          }
          
          regionThreats[region].count++;
          
          if (['CATASTROPHIC', 'SEVERE', 'HIGH'].includes(riskLevel)) {
            regionThreats[region].highRisk++;
          }
          
          const energy = neo.primaryApproach?.calculations?.kineticEnergy?.megatons || 0;
          regionThreats[region].totalEnergy += energy;
        }
      });
    });
    
    console.log('Threats by Region:\n');
    
    Object.entries(regionThreats)
      .sort((a, b) => b[1].highRisk - a[1].highRisk)
      .forEach(([region, data]) => {
        console.log(`${region}:`);
        console.log(`  Total NEOs: ${data.count}`);
        console.log(`  High Risk: ${data.highRisk}`);
        console.log(`  Combined Energy: ${data.totalEnergy.toFixed(1)} MT`);
        console.log('');
      });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// =============================================================================
// Example 6: Export Impact Points for Mapping
// =============================================================================
async function example6_ExportForMapping() {
  console.log('\n=== Example 6: Export for Mapping ===\n');
  
  try {
    const response = await axios.get(`${API_BASE}/`);
    
    // Collect all impact points for visualization
    const mapData = [];
    
    response.data.processedDates.forEach(dateData => {
      dateData.neos.forEach(neo => {
        const impactPoint = neo.geographicImpactData?.impactLocation?.estimatedImpactPoint;
        const risk = neo.geographicImpactData?.geographicRisk;
        
        if (impactPoint) {
          mapData.push({
            name: neo.name,
            lat: impactPoint.latitude,
            lon: impactPoint.longitude,
            diameter: neo.diameter.average,
            craterRadius: risk?.craterRadius?.value || 0,
            riskLevel: risk?.riskLevel || 'UNKNOWN',
            energy: neo.primaryApproach?.calculations?.kineticEnergy?.megatons || 0,
            date: neo.primaryApproach?.closeApproachDate
          });
        }
      });
    });
    
    console.log(`Collected ${mapData.length} impact points for mapping\n`);
    console.log('Sample GeoJSON Feature:');
    console.log(JSON.stringify({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [mapData[0].lon, mapData[0].lat]
      },
      properties: {
        name: mapData[0].name,
        diameter: mapData[0].diameter,
        craterRadius: mapData[0].craterRadius,
        riskLevel: mapData[0].riskLevel,
        energy: mapData[0].energy,
        date: mapData[0].date
      }
    }, null, 2));
    
    console.log('\nThis can be used with Leaflet, Mapbox, or other mapping libraries');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// =============================================================================
// Example 7: Calculate Total Global Risk
// =============================================================================
async function example7_GlobalRisk() {
  console.log('\n=== Example 7: Global Risk Assessment ===\n');
  
  try {
    const response = await axios.get(`${API_BASE}/`, {
      params: {
        start_date: '2025-09-01',
        end_date: '2025-12-31'
      }
    });
    
    let totalEnergy = 0;
    let totalAffectedArea = 0;
    let catastrophicEvents = 0;
    let severeEvents = 0;
    let highRiskEvents = 0;
    
    response.data.processedDates.forEach(dateData => {
      dateData.neos.forEach(neo => {
        const calc = neo.primaryApproach?.calculations;
        const geoRisk = neo.geographicImpactData?.geographicRisk;
        
        if (calc?.kineticEnergy) {
          totalEnergy += calc.kineticEnergy.megatons;
        }
        
        if (geoRisk?.estimatedAffectedArea) {
          totalAffectedArea += geoRisk.estimatedAffectedArea.value;
        }
        
        if (geoRisk?.riskLevel === 'CATASTROPHIC') catastrophicEvents++;
        if (geoRisk?.riskLevel === 'SEVERE') severeEvents++;
        if (geoRisk?.riskLevel === 'HIGH') highRiskEvents++;
      });
    });
    
    console.log(`Period: 2025-09-01 to 2025-12-31\n`);
    console.log(`Total NEOs: ${response.data.elementCount}`);
    console.log(`Hazardous: ${response.data.summary.hazardousCount}`);
    console.log(`\nGlobal Risk Metrics:`);
    console.log(`  Catastrophic Events: ${catastrophicEvents}`);
    console.log(`  Severe Events: ${severeEvents}`);
    console.log(`  High Risk Events: ${highRiskEvents}`);
    console.log(`  Combined Energy: ${totalEnergy.toFixed(1)} MT`);
    console.log(`  Total Affected Area: ${totalAffectedArea.toFixed(0)} km²`);
    
    // Risk score (simplified)
    const riskScore = (catastrophicEvents * 100) + (severeEvents * 50) + (highRiskEvents * 25);
    console.log(`\nRisk Score: ${riskScore}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// =============================================================================
// Run All Examples
// =============================================================================
async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  NASA Meteoroid Impact Calculator - Usage Examples        ║');
  console.log('║  Geographic Impact Location Features                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  await example1_BasicCall();
  await example2_GeographicData();
  await example3_ProbabilityMap();
  await example4_MostDangerous();
  await example5_RegionalThreats();
  await example6_ExportForMapping();
  await example7_GlobalRisk();
  
  console.log('\n✅ All examples completed!\n');
}

// =============================================================================
// Execute
// =============================================================================
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  example1_BasicCall,
  example2_GeographicData,
  example3_ProbabilityMap,
  example4_MostDangerous,
  example5_RegionalThreats,
  example6_ExportForMapping,
  example7_GlobalRisk
};

