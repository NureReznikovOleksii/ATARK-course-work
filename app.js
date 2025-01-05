const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const deviceRoutes = require('./routes/devices');
const deviceLogsRoutes = require('./routes/deviceLogs');
const notificationsRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const userRoutes = require('./routes/user');
const settingsRoutes = require('./routes/settings');
// const ngrok = require('ngrok'); 

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/deviceLogs', deviceLogsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);




// Sync database and start server
sequelize.sync().then(async () => {
    console.log('Database synchronized without altering tables.');

    // Start the server
    app.listen(PORT, async () => {
        console.log(`Server running on port http://localhost:${PORT}`);

        // Закомментировано для отключения ngrok
        /*
        try {
            // Start ngrok tunnel
            const url = await ngrok.connect({
                addr: PORT,
                proto: 'http',
                host_header: 'rewrite',
                authtoken: process.env.NGROK_AUTH_TOKEN, // Добавьте ваш ngrok auth token в .env
                region: 'eu', 
            });
            console.log(`ngrok tunnel established at: ${url}`);
        } catch (err) {
            console.error('Error starting ngrok:', err);
        }
        */
    });
}).catch((error) => {
    console.error('Unable to synchronize database:', error);
});
