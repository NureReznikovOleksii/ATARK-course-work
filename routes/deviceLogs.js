const express = require('express');
const { DeviceLog, Notification, Setting } = require('../models');
const router = express.Router();

// Збереження даних про споживання енергії
router.post('/', async (req, res) => {
    try {
        const { DeviceID, UserID, Room1Power, Room2Power } = req.body;

        // Отримання MaxPower із таблиці Settings
        const setting = await Setting.findOne({ where: { DeviceID } });
        const MaxPower = setting ? setting.MaxPower : 500;

        // Додавання нового запису до DeviceLogs
        const log = await DeviceLog.create({
            DeviceID,
            UserID,
            Room1Power,
            Room2Power,
            MaxPower,
            CreatedAt: new Date(),
        });

        // Перевірка на перевищення максимальної потужності
        if (Room1Power > MaxPower || Room2Power > MaxPower) {
            await Notification.create({
                UserID,
                DeviceID,
                Message: `Power exceeded in device ${DeviceID}`,
                IsRead: false,
                CreatedAt: new Date(),
            });
        }

        res.status(201).json({ message: 'Log saved successfully', log });
    } catch (error) {
        console.error('Error saving log:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отримання повного списку логів пристрою
router.get('/', async (req, res) => {
    try {
        const { DeviceID, UserID } = req.query;

        // Проверка, что параметры не являются undefined
        if (!DeviceID || !UserID) {
            return res.status(400).json({ error: 'DeviceID and UserID are required' });
        }

        const logs = await DeviceLog.findAll({
            where: { DeviceID, UserID },
            order: [['CreatedAt', 'DESC']],
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Видалення записів логів за ID
router.delete('/:logId', async (req, res) => {
    try {
        const { logId } = req.params;

        const deletedCount = await DeviceLog.destroy({
            where: { LogID: logId },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }

        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get logs by UserID and DeviceID
router.get('/logs', async (req, res) => {
    try {
        const { UserID, DeviceID } = req.query;

        // Validate input parameters
        if (!UserID || !DeviceID) {
            return res.status(400).json({ error: 'UserID and DeviceID are required' });
        }

        // Fetch logs matching the UserID and DeviceID
        const logs = await DeviceLog.findAll({
            where: {
                UserID,
                DeviceID,
            },
            order: [['CreatedAt', 'DESC']], // Sort by most recent logs
        });

        // Return logs or a message if none are found
        if (logs.length === 0) {
            return res.status(404).json({ message: 'No logs found for the specified UserID and DeviceID' });
        }

        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs by UserID and DeviceID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
