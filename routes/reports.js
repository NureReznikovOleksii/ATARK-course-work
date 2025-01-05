const { Op } = require('sequelize');
const express = require('express');
const { Device, DeviceLog, Notification } = require('../models');
const router = express.Router();

// Report 1: Power Consumption Summary
router.get('/power-summary', async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;

        if (!userId || !startDate || !endDate) {
            return res.status(400).json({ error: 'userId, startDate, and endDate are required' });
        }

        const logs = await DeviceLog.findAll({
            include: [{ model: Device, where: { UserID: userId } }],
            where: {
                CreatedAt: {
                    $between: [new Date(startDate), new Date(endDate)],
                },
            },
        });

        const totalPower = logs.reduce((sum, log) => {
            return sum + log.Room1Power + log.Room2Power;
        }, 0);

        res.json({ userId, totalPower, startDate, endDate });
    } catch (error) {
        console.error('Error fetching power summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Report 2: Over Limit Alerts Summary
router.get('/over-limit-alerts', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const notifications = await Notification.findAll({
            where: {
                UserID: userId,
                Message: {
                    [Op.like]: '%Power exceeded%',
                },
            },
            attributes: ['DeviceID', 'Message', 'CreatedAt'], // Fetch specific attributes
            order: [['CreatedAt', 'DESC']], // Sort by newest
        });

        // Group notifications by DeviceID
        const deviceAlerts = notifications.reduce((summary, notification) => {
            const deviceId = notification.DeviceID;
            if (!summary[deviceId]) {
                summary[deviceId] = [];
            }
            summary[deviceId].push({
                message: notification.Message,
                createdAt: notification.CreatedAt,
            });
            return summary;
        }, {});

        res.json({ userId, deviceAlerts });
    } catch (error) {
        console.error('Error fetching over-limit alerts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
