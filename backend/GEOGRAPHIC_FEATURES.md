# Meteoroid Impact Calculator - Geographic Location Features

## Overview

This enhanced NASA NEO tracking system now includes **latitude and longitude calculations** to estimate where a meteoroid impact would occur on Earth's surface.

## Features Implemented

### 1. **Impact Location Estimation** 🌍
- Calculates estimated latitude and longitude of potential impact
- Accounts for Earth's rotation during approach
- Uses Greenwich Mean Sidereal Time (GMST) calculations
- Provides coordinate precision to 4 decimal places

### 2. **Monte Carlo Probability Mapping** 🎲
- Generates multiple potential impact points based on orbital uncertainty
- Creates a probability distribution map across Earth's surface
- Simulates up to 100 impact scenarios per NEO
- Useful for visualization and risk assessment

### 3. **Geographic Risk Assessment** 🗺️
- Identifies which continent/region would be affected
- Determines if impact is over ocean or populated land
- Calculates affected area based on crater size and blast radius
- Assigns regional risk levels (CATASTROPHIC, SEVERE, HIGH, MODERATE, LOW)

### 4. **Enhanced Data Integration** 🔗
- Seamlessly integrates with existing NASA API data
- Works on top of kinetic energy and crater calculations
- Maintains all original NEO data while adding geographic context

---

## API Response Structure

When you call `GET /`, the response now includes `geographicImpactData`:

```json
{
  "elementCount": 123,
  "processedDates": [
    {
      "date": "2025-09-01",
      "neos": [
        {
          "id": "3445666",
          "name": "(2009 XO)",
          "isPotentiallyHazardous": true,
          "diameter": {
            "min": 100,
            "max": 250,
            "average": 175,
            "unit": "meters"
          },
          "primaryApproach": {
            "closeApproachDate": "2025-09-01",
            "velocity": { ... },
            "missDistance": { ... },
            "calculations": {
              "mass": { "value": 1.4e10, "unit": "kg" },
              "kineticEnergy": { "value": 1.6e18, "megatons": 382.5 },
              "estimatedCrater": { "diameter": 2500, "radius": 1250 },
              "impactProbability": { ... }
            }
          },
          "geographicImpactData": {
            "impactLocation": {
              "estimatedImpactPoint": {
                "latitude": 12.3456,
                "longitude": -78.9012,
                "confidence": "low",
                "note": "Simplified estimate. Actual impact location requires precise orbital integration."
              },
              "impactTimestamp": "2025-09-01T14:23:45.000Z",
              "coordinateSystem": "WGS84"
            },
            "geographicRisk": {
              "primaryRegion": "South America",
              "continent": "South America",
              "coordinates": {
                "latitude": 12.3456,
                "longitude": -78.9012
              },
              "craterRadius": {
                "value": 1.25,
                "unit": "km"
              },
              "estimatedAffectedArea": {
                "value": 14.726,
                "unit": "km²"
              },
              "riskLevel": "HIGH"
            },
            "probabilityMap": {
              "impactPoints": [
                { "latitude": 10.2341, "longitude": -80.1234, "probability": 0.02 },
                { "latitude": 14.5678, "longitude": -76.8901, "probability": 0.02 },
                // ... 48 more points
              ],
              "samples": 50,
              "uncertaintyKm": 1000,
              "method": "Monte Carlo simulation (simplified)"
            },
            "earthRotationData": {
              "rotationPeriod": 23.9344696,
              "degreesPerHour": 15.041069,
              "note": "Earth rotation affects the exact impact location within the uncertainty window"
            }
          }
        }
      ]
    }
  ],
  "summary": {
    "totalNEOs": 123,
    "hazardousCount": 15,
    "mostDangerousNEO": { ... }
  }
}
```

---

## Technical Implementation

### Libraries Used

- **luxon**: Advanced date/time handling for astronomical calculations
- **axios**: NASA API data fetching (already installed)
- **Native JavaScript Math**: Coordinate transformations and trigonometry

### Key Calculations

#### 1. **Subsatellite Point Calculation**
```javascript
// Earth rotates ~15.04 degrees per hour
GMST = 280.46061837 + 360.98564736629 × (days since J2000)
Longitude = Right Ascension - GMST
Latitude = Declination
```

#### 2. **Cartesian to Geographic Conversion**
```javascript
Longitude = arctan2(y, x) × (180/π)
Latitude = arctan2(z, √(x² + y²)) × (180/π)
```

#### 3. **Impact Probability Distribution**
```javascript
// Monte Carlo approach
For each sample (1 to N):
  - Add random variation based on orbital uncertainty
  - Calculate lat/long with Earth rotation
  - Assign probability = 1/N
```

#### 4. **Affected Area Calculation**
```javascript
// Blast effects extend ~3× crater radius
Affected Area = π × (crater_radius × 3)²
```

---

## Usage Examples

### Basic Usage
```bash
# Get NEO data with geographic calculations
curl "http://localhost:3000/?start_date=2025-09-01&end_date=2025-09-07"
```

### Custom Date Range
```bash
curl "http://localhost:3000/?start_date=2025-10-01&end_date=2025-10-15"
```

### Example: Extract Impact Coordinates
```javascript
const response = await fetch('http://localhost:3000/?start_date=2025-09-01&end_date=2025-09-07');
const data = await response.json();

// Get first NEO's impact location
const firstNEO = data.processedDates[0].neos[0];
const impactPoint = firstNEO.geographicImpactData.impactLocation.estimatedImpactPoint;

console.log(`Impact would occur at: ${impactPoint.latitude}, ${impactPoint.longitude}`);
console.log(`Region: ${firstNEO.geographicImpactData.geographicRisk.primaryRegion}`);
console.log(`Risk Level: ${firstNEO.geographicImpactData.geographicRisk.riskLevel}`);
```

---

## Constants and Configuration

### Earth Constants Used

```javascript
EARTH_CONSTANTS = {
  RADIUS_KM: 6371,                   // Mean Earth radius
  ROTATION_PERIOD_HOURS: 23.9344696, // Sidereal day
  DEGREES_PER_HOUR: 15.041069,       // Rotation rate
  EQUATORIAL_RADIUS_KM: 6378.137,    // Equatorial radius
  POLAR_RADIUS_KM: 6356.752,         // Polar radius
  OBLIQUITY: 23.44                   // Axial tilt
}
```

### Risk Level Thresholds

| Affected Area (km²) | Populated Land | Ocean/Uninhabited |
|---------------------|----------------|-------------------|
| > 100,000           | CATASTROPHIC   | SEVERE            |
| > 10,000            | SEVERE         | HIGH              |
| > 1,000             | HIGH           | MODERATE          |
| > 100               | MODERATE       | LOW               |
| < 100               | LOW            | LOW               |

---

## Accuracy Notes and Limitations

### What This System Does ✅
- Estimates impact coordinates based on approach geometry
- Accounts for Earth's rotation during approach
- Provides probabilistic impact zones
- Identifies affected geographic regions
- Calculates blast radius and affected area

### What This System Doesn't Do ❌
- **Full N-body orbital integration**: Real calculations require accounting for gravitational effects of all planets
- **Atmospheric effects**: Entry angle, ablation, and breakup are not modeled
- **Precise orbital uncertainty**: NASA's actual systems use covariance matrices from observations
- **Detailed terrain analysis**: No consideration of mountains, oceans depths, etc.
- **Impact angle calculation**: Assumes vertical impact for crater estimates

### Comparison to NASA Systems

| Feature | This System | NASA/JPL Sentry |
|---------|-------------|-----------------|
| Orbital Propagation | Simplified Kepler's Laws | Full N-body integration |
| Impact Probability | Distance-based estimate | Monte Carlo with orbital covariance |
| Geographic Location | GMST-based estimation | Full ephemeris integration |
| Crater Size | Empirical scaling | Physics-based hydrocodes |
| Update Frequency | On-demand via API | Continuous with new observations |

---

## Integration with Existing Features

The geographic calculations work seamlessly with:

1. **Kinetic Energy Calculations** - Uses KE to estimate crater size for geographic risk
2. **Mass Calculations** - Influences crater radius which affects impact area
3. **Impact Probability** - Combined with location for regional risk assessment
4. **Next Pass Estimates** - Future passes can also have location estimates

---

## Future Enhancements

Potential improvements for more accurate calculations:

1. **Integration with JPL HORIZONS API** - Get precise ephemeris data
2. **Atmospheric Entry Modeling** - Calculate breakup altitude and ground scatter
3. **Impact Angle Calculation** - Use velocity vectors for oblique impacts
4. **Population Density Overlay** - Estimate casualties based on impact location
5. **Real-time Orbital Uncertainty** - Fetch covariance data from NASA
6. **Tsunami Modeling** - For ocean impacts, calculate wave propagation
7. **Climate Impact Assessment** - Estimate global effects for large impacts

---

## Testing the Implementation

### Start the Server
```bash
npm start
```

### Test Endpoint
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/?start_date=2025-09-01&end_date=2025-09-07" | Select-Object -Expand Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Or use a browser
http://localhost:3000/?start_date=2025-09-01&end_date=2025-09-07
```

---

## Contributing

This implementation uses simplified models for educational and demonstration purposes. For production use cases requiring high accuracy, integrate directly with:

- **NASA JPL HORIZONS System**: https://ssd.jpl.nasa.gov/horizons/
- **JPL Sentry Impact Risk**: https://cneos.jpl.nasa.gov/sentry/
- **Minor Planet Center**: https://www.minorplanetcenter.net/

---

## License & Attribution

These calculations were implemented with AI assistance and are based on:
- NASA NEO APIs
- Standard orbital mechanics equations
- Empirical impact crater scaling laws
- Greenwich Mean Sidereal Time calculations

**Important**: This system provides estimates for educational purposes. For actual planetary defense and impact assessment, rely on official NASA/ESA systems.
