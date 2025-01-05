const express = require('express');
const { Device, DeviceLog, Setting } = require('../models');
const router = express.Router();
const { format } = require('date-fns'); 

// Получить данные устройства
router.get('/:deviceId', async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.deviceId, {
            include: [{ model: Setting, required: false }],
        });
        if (!device) return res.status(404).json({ error: 'Device not found' });
        res.json(device);
    } catch (error) {
        console.error('Error fetching device:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Обновление устройства и запись логов
router.put('/:deviceId', async (req, res) => {
    try {
        const { room1_power, room2_power } = req.body;

        let device = await Device.findByPk(req.params.deviceId);

        if (!device) {
            // Создать новое устройство, если его нет
            device = await Device.create({
                DeviceID: req.params.deviceId,
                UserID: 1, // Заменяем на значение по умолчанию
                DeviceName: `doubleD`,
                DeviceType: `doubleDevice`,
                Room1Power: room1_power || 0,
                Room2Power: room2_power || 0,
                CreatedAt: new Date(), // Формат автоматически поддерживается Sequelize
            });

            // Создать настройки для нового устройства
            await Setting.create({
                DeviceID: device.DeviceID,
                MaxPower: 500, // Значение по умолчанию
                UpdatedAt: new Date(), // Формат автоматически поддерживается Sequelize
            });

            return res.status(201).json({ message: 'Device created successfully', device });
        }

        // Найти настройки устройства
        const settings = await Setting.findOne({
            where: { DeviceID: device.DeviceID },
        });

        const maxPower = settings ? settings.MaxPower : 500;

        // Сохранить текущие данные в логи
        await DeviceLog.create({
            DeviceID: device.DeviceID,
            UserID: 1, // Значение по умолчанию
            Room1Power: device.Room1Power,
            Room2Power: device.Room2Power,
            MaxPower: maxPower,
            CreatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '), // Преобразование в DATETIME
        });

        // Обновить устройство
        device.Room1Power = room1_power;
        device.Room2Power = room2_power;
        await device.save();

        res.json({ message: 'Device updated successfully', device });
    } catch (error) {
        console.error('Error updating/creating device:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Обновить настройки устройства
router.put('/:deviceId/settings', async (req, res) => {
    try {
        const { maxPower } = req.body; // Получаем maxPower из тела запроса
        if (!maxPower) return res.status(400).json({ error: 'maxPower is required' });

        const setting = await Setting.findOne({ where: { DeviceID: req.params.deviceId } });
        if (!setting) return res.status(404).json({ error: 'Settings not found' });

        setting.MaxPower = maxPower;
        setting.UpdatedAt = new Date();
        await setting.save();

        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Цей маршрут повертатиме поточні налаштування пристрою.
router.get('/:deviceId/settings', async (req, res) => {
    try {
        const setting = await Setting.findOne({ where: { DeviceID: req.params.deviceId } });
        if (!setting) return res.status(404).json({ error: 'Settings not found' });
        res.json(setting); // Отправляем настройки в формате JSON
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Маршрут для получения лимита мощности
router.get('/get_limit/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10); // Преобразуем в число

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid UserID. It must be a number.' });
        }

        // Найти настройки по UserID через связь Devices -> Settings
        const setting = await Setting.findOne({
            include: [
                {
                    model: Device,
                    where: { UserID: userId }
                }
            ]
        });

        if (!setting) {
            return res.status(404).json({ error: 'Settings not found for the specified user' });
        }

        res.json({ max_power: setting.MaxPower });
    } catch (error) {
        console.error('Error fetching limit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




module.exports = router;
