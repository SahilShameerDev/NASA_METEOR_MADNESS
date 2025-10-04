# NASA Meteoroid Impact Calculator API 🌠

A comprehensive Node.js API that fetches Near-Earth Object (NEO) data from NASA and performs advanced calculations including:
- Impact probability estimation
- Kinetic energy and crater size calculations
- **Geographic impact location (Latitude/Longitude)**
- Regional risk assessment
- Next orbital pass predictions

---

## 🚀 Quick Start

### Installation

```bash
# Navigate to project directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3000`

### Dependencies

```json
{
  "axios": "^1.12.2",      // NASA API requests
  "luxon": "^3.x.x",       // Date/time calculations for astronomy
  "express": "~4.16.1",    // Web server
  "cors": "^2.8.5"         // Cross-origin support
}
```

---

## 📡 API Endpoints

### GET `/`

Fetch NEO data with comprehensive impact calculations and geographic analysis.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | String | `2025-09-01` | Start date (YYYY-MM-DD) |
| `end_date` | String | `2025-09-07` | End date (YYYY-MM-DD) |

#### Example Request

```bash
# Default date range
curl http://localhost:3000/

# Custom date range
curl "http://localhost:3000/?start_date=2025-10-01&end_date=2025-10-07"

# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/?start_date=2025-10-01&end_date=2025-10-07"
```

#### Response Structure

```json
{
  "elementCount": 123,
  "links": {
    "next": "...",
    "previous": "...",
    "self": "..."
  },
  "processedDates": [
    {
      "date": "2025-09-01",
      "neoCount": 15,
      "neos": [
        {
          "id": "3445666",
          "name": "(2009 XO)",
          "isPotentiallyHazardous": true,
          "absoluteMagnitude": 22.1,
          "diameter": {
            "min": 100,
            "max": 250,
            "average": 175,
            "unit": "meters"
          },
          "primaryApproach": {
            "closeApproachDate": "2025-09-01",
            "closeApproachDateFull": "2025-09-01T14:23:45.000Z",
            "orbitingBody": "Earth",
            "velocity": {
              "kilometersPerSecond": 15.234,
              "kilometersPerHour": 54842.4,
              "milesPerHour": 34078.2,
              "metersPerSecond": 15234
            },
            "missDistance": {
              "astronomical": 0.0334,
              "lunar": 13.0,
              "kilometers": 5000000,
              "miles": 3106855
            },
            "calculations": {
              "mass": {
                "value": 14137166941.15,
                "unit": "kg"
              },
              "kineticEnergy": {
                "value": 1.641e18,
                "unit": "Joules",
                "megatons": 392.3
              },
              "estimatedCrater": {
                "diameter": 2547.5,
                "radius": 1273.75,
                "unit": "meters"
              },
              "impactProbability": {
                "value": 0.000001,
                "percentage": "0.00010000",
                "riskLevel": "MINIMAL"
              },
              "nextPassEstimate": {
                "estimatedOrbitalPeriod": {
                  "seconds": 78892800,
                  "days": 912.5,
                  "years": 2.5
                },
                "estimatedNextPass": "2028-01-15",
                "note": "Simplified estimate. Actual orbital mechanics require precise tracking.",
                "confidence": "low"
              }
            }
          },
          "geographicImpactData": {
            "impactLocation": {
              "estimatedImpactPoint": {
                "latitude": -12.3456,
                "longitude": 145.6789,
                "confidence": "low",
                "note": "Simplified estimate. Actual impact location requires precise orbital integration."
              },
              "impactTimestamp": "2025-09-01T14:23:45.000Z",
              "coordinateSystem": "WGS84"
            },
            "geographicRisk": {
              "primaryRegion": "Australia",
              "continent": "Australia",
              "coordinates": {
                "latitude": -12.3456,
                "longitude": 145.6789
              },
              "craterRadius": {
                "value": 1.27375,
                "unit": "km"
              },
              "estimatedAffectedArea": {
                "value": 50.95,
                "unit": "km²"
              },
              "riskLevel": "MODERATE"
            },
            "probabilityMap": {
              "impactPoints": [
                {
                  "latitude": -10.1234,
                  "longitude": 143.5678,
                  "probability": 0.02
                },
                // ... 49 more impact points
              ],
              "samples": 50,
              "uncertaintyKm": 1000,
              "method": "Monte Carlo simulation (simplified)",
              "note": "Demonstration. Real calculations require full orbital covariance analysis."
            },
            "earthRotationData": {
              "rotationPeriod": 23.9344696,
              "degreesPerHour": 15.041069,
              "note": "Earth rotation affects exact impact location within uncertainty window"
            }
          },
          "closeApproaches": [ /* Array of all close approaches */ ]
        }
      ]
    }
  ],
  "summary": {
    "totalNEOs": 123,
    "hazardousCount": 15,
    "nonHazardousCount": 108,
    "maxCraterDiameter": {
      "value": 5000,
      "unit": "meters"
    },
    "highestImpactProbability": {
      "value": 0.000001,
      "percentage": "0.00010000"
    },
    "mostDangerousNEO": {
      "name": "(2009 XO)",
      "date": "2025-09-01",
      "probability": "0.00010000",
      "riskLevel": "MINIMAL"
    }
  }
}
```

---

## 🧮 Calculations Performed

### 1. **Orbital Mechanics**

#### Semi-Major Axis (Vis-viva Equation)
```
a = 1 / ((2/r) - (v²/GM))
```

#### Orbital Period (Kepler's Third Law)
```
T² = (4π² × a³) / GM
```

### 2. **Impact Energy**

#### Mass Calculation
```
m = ρ × (4/3)π × R³
```
- ρ = density (3000 kg/m³ for stony, 8000 kg/m³ for iron)

#### Kinetic Energy
```
KE = ½ × m × v²
```

#### Crater Diameter (Empirical Scaling)
```
D_crater = C × (KE/g)^(1/3.4)
```
- C ≈ 0.2 (scaling constant)
- g = 9.8 m/s² (Earth gravity)

### 3. **Geographic Location** 🌍

#### Greenwich Mean Sidereal Time
```
GMST = 280.46061837 + 360.98564736629 × (days since J2000)
```

#### Impact Coordinates
```
Latitude = Declination
Longitude = Right Ascension - GMST
```

#### Affected Area
```
Area = π × (crater_radius × 3)²
```
(Blast effects extend ~3× crater radius)

### 4. **Risk Assessment**

| Affected Area | Populated Land | Ocean/Remote |
|--------------|----------------|--------------|
| > 100,000 km² | CATASTROPHIC | SEVERE |
| > 10,000 km² | SEVERE | HIGH |
| > 1,000 km² | HIGH | MODERATE |
| > 100 km² | MODERATE | LOW |
| < 100 km² | LOW | LOW |

---

## 📁 Project Structure

```
backend/
├── app.js                          # Express app configuration
├── package.json                    # Dependencies
├── bin/
│   └── www                         # Server startup
├── routes/
│   ├── index.js                    # Main API route
│   └── users.js                    # User routes
├── services/
│   ├── nasa.js                     # NASA API integration
│   ├── calculate_hit.js            # Impact calculations
│   └── calculate_lat_and_long.js   # Geographic calculations ⭐ NEW
├── public/                         # Static files
├── views/                          # Jade templates
├── GEOGRAPHIC_FEATURES.md          # Geographic features documentation ⭐ NEW
└── README.md                       # This file
```

---

## 🔧 Configuration

### NASA API Key

Update the API key in `services/nasa.js`:

```javascript
const NASA_API_KEY = 'YOUR_API_KEY_HERE';
```

Get a free API key at: https://api.nasa.gov/

### Timeout Settings

Default timeout is 30 seconds. Adjust in `services/nasa.js`:

```javascript
const nasaApi = axios.create({
  baseURL: 'https://api.nasa.gov',
  timeout: 30000  // milliseconds
});
```

---

## 🎯 Use Cases

### 1. **Planetary Defense Planning**
Identify which regions would be affected by potential impacts.

```javascript
const hazardousNEOs = data.processedDates
  .flatMap(d => d.neos)
  .filter(neo => neo.isPotentiallyHazardous);

hazardousNEOs.forEach(neo => {
  const risk = neo.geographicImpactData?.geographicRisk;
  console.log(`${neo.name}: ${risk?.primaryRegion} - ${risk?.riskLevel}`);
});
```

### 2. **Educational Visualization**
Create interactive maps showing impact probability distributions.

```javascript
const probabilityMap = neo.geographicImpactData?.probabilityMap;
if (probabilityMap) {
  probabilityMap.impactPoints.forEach(point => {
    // Plot on map: point.latitude, point.longitude, point.probability
  });
}
```

### 3. **Risk Assessment**
Evaluate total risk from all approaching objects.

```javascript
const summary = data.summary;
console.log(`Total NEOs: ${summary.totalNEOs}`);
console.log(`Hazardous: ${summary.hazardousCount}`);
console.log(`Largest crater: ${summary.maxCraterDiameter.value}m`);
```

---

## 🧪 Testing

### Manual Testing

```bash
# Start server
npm start

# Test in another terminal
curl http://localhost:3000/

# Or use browser
http://localhost:3000/?start_date=2025-10-01&end_date=2025-10-07
```

### Example Test Script

```javascript
const axios = require('axios');

async function testAPI() {
  try {
    const response = await axios.get('http://localhost:3000/', {
      params: {
        start_date: '2025-10-01',
        end_date: '2025-10-07'
      }
    });
    
    console.log('Total NEOs:', response.data.elementCount);
    console.log('Hazardous:', response.data.summary.hazardousCount);
    
    // Check first NEO
    const firstNEO = response.data.processedDates[0].neos[0];
    console.log('\nFirst NEO:', firstNEO.name);
    console.log('Impact Location:', firstNEO.geographicImpactData?.impactLocation);
    console.log('Risk Level:', firstNEO.geographicImpactData?.geographicRisk?.riskLevel);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
```

---

## ⚠️ Important Notes

### Accuracy Limitations

This system provides **educational estimates**. For actual planetary defense:

❌ **This System Does NOT:**
- Perform full N-body orbital integration
- Account for planetary perturbations
- Model atmospheric entry and breakup
- Use real orbital uncertainty data
- Provide legally defensible impact predictions

✅ **This System DOES:**
- Demonstrate orbital mechanics concepts
- Provide order-of-magnitude estimates
- Show geographic impact methodology
- Integrate NASA's observed data
- Calculate realistic energy and crater sizes

### When to Use Official NASA Data

For real impact risk assessment, always consult:
- **JPL Sentry**: https://cneos.jpl.nasa.gov/sentry/
- **NEO Close Approaches**: https://cneos.jpl.nasa.gov/ca/
- **HORIZONS System**: https://ssd.jpl.nasa.gov/horizons/

---

## 🌟 Features

- ✅ Real-time NASA NEO data integration
- ✅ Kinetic energy calculations (Joules & Megatons TNT)
- ✅ Crater diameter estimation
- ✅ Impact probability modeling
- ✅ **Geographic impact location (Lat/Long)** ⭐ NEW
- ✅ **Regional risk assessment** ⭐ NEW
- ✅ **Monte Carlo probability mapping** ⭐ NEW
- ✅ Next orbital pass estimation
- ✅ Comprehensive summary statistics
- ✅ Risk level classification
- ✅ Earth rotation accounting

---

## 📚 Further Reading

### Orbital Mechanics
- [Kepler's Laws](https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion)
- [Vis-viva Equation](https://en.wikipedia.org/wiki/Vis-viva_equation)

### Impact Physics
- [Impact Crater Scaling](https://www.lpi.usra.edu/publications/books/CB-954/CB-954.intro.html)
- [Purdue Impact Calculator](https://impact.ese.ic.ac.uk/ImpactEarth/)

### Celestial Mechanics
- [Greenwich Mean Sidereal Time](https://en.wikipedia.org/wiki/Sidereal_time)
- [Coordinate Systems](https://en.wikipedia.org/wiki/Celestial_coordinate_system)

---

## 🤝 Contributing

Potential enhancements:
1. Real JPL HORIZONS API integration
2. Atmospheric entry modeling
3. Population density overlay
4. Tsunami propagation (ocean impacts)
5. Climate impact assessment
6. Real-time orbital uncertainty from NASA

---

## 📝 License

This project uses NASA's public APIs and is for educational purposes.

**Attribution**: Calculations implemented with AI assistance based on established orbital mechanics and impact physics equations.

---

## 👨‍💻 Development

Built with:
- Node.js & Express
- Axios for HTTP requests
- Luxon for astronomical time calculations
- NASA NEO Web Service API

---

## 📞 Support

For issues or questions:
1. Check `GEOGRAPHIC_FEATURES.md` for detailed documentation
2. Review NASA API documentation: https://api.nasa.gov/
3. Consult orbital mechanics references above

---

**Remember**: This is a demonstration system. For actual planetary defense, rely on NASA/ESA official systems! 🛡️
