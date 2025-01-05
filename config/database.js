const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_SERVER, // Изменено с DB_HOST на DB_SERVER
    dialect: 'mssql',
    port: process.env.DB_PORT,
    logging: false,
    dialectOptions: {
        options: {
            encrypt: false, // Если у вас нет сертификата
            trustServerCertificate: true, // Для локального сервера
        },
    },
});

module.exports = sequelize;
