const express = require('express');
const { Notification } = require('../models');
const router = express.Router();

// Отримання списку сповіщень
router.get('/', async (req, res) => {
    try {
        const { UserID, IsRead } = req.query;

        const notifications = await Notification.findAll({
            where: { UserID, ...(IsRead && { IsRead }) },
            order: [['CreatedAt', 'DESC']],
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Позначення сповіщення як прочитаного
router.put('/:notificationId', async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByPk(notificationId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        notification.IsRead = true;
        await notification.save();

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
