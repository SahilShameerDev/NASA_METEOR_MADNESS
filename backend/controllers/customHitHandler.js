
/* 
Custom Hit Handler --> Values to control the custom hit endpoint
        1. date (YYYY-MM-DD)
        2. lat (latitude in decimal degrees)
        3. long (longitude in decimal degrees)
        4. velocity (in km/s)
        5. diameter (in meters)
        6. mass
        7. density (in g/cm^3)
        8. approach (in lunar distances)
        9. miss (in km)
        10. hazard (boolean true/false)
*/

module.exports.getCustomHit = async (req, res) => {
    try {
        const {
            date,
            lat,
            long,
            velocity,
            diameter,
            mass,
            density,
            approach,
            miss,
            hazard
        } = req.body;

        // Validate input
        if (!date || !lat || !long || !velocity || !diameter || !mass || !density || !approach || !miss || !hazard) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Process the custom hit data
        const customHitData = {
            date,
            location: {
                latitude: lat,
                longitude: long
            },
            velocity,
            size: {
                diameter,
                mass,
                density
            },
            approach,
            miss,
            hazard
        };

        // Return the processed data
        res.json({ message: 'Custom hit data processed successfully', data: customHitData });
    } catch (error) {
        console.error('Error processing custom hit data:', error);
        res.status(500).json({ error: 'Failed to process custom hit data', details: error.message });
    }
};
