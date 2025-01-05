const express = require('express');
const { Setting } = require('../models');
const router = express.Router();

// Update MaxPower for a specific DeviceID
router.put('/updateMaxPower/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { MaxPower } = req.body;

        // Check if MaxPower is provided
        if (!MaxPower) {
            return res.status(400).json({ error: 'MaxPower is required' });
        }

        // Find the Setting record for the given DeviceID
        const setting = await Setting.findOne({ where: { DeviceID: deviceId } });
        if (!setting) {
            return res.status(404).json({ error: 'Setting not found for the given DeviceID' });
        }

        // Update the MaxPower value
        setting.MaxPower = MaxPower;
        setting.UpdatedAt = new Date();
        await setting.save();

        res.json({ message: 'MaxPower updated successfully', setting });
    } catch (error) {
        console.error('Error updating MaxPower:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
