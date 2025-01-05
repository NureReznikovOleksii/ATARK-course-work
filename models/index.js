const Sequelize = require('sequelize');
const sequelize = require('../config/database'); // Убедитесь, что путь к файлу config/database.js правильный

// Модель пользователя
const User = sequelize.define('User', {
    UserID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    UserName: { type: Sequelize.STRING, allowNull: false },
    Email: { type: Sequelize.STRING, allowNull: false, unique: true },
    PasswordHash: { type: Sequelize.STRING, allowNull: false },
    CreatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
}, {
    timestamps: false, // Отключает автоматическое добавление createdAt и updatedAt
});

// Модель устройства
const Device = sequelize.define('Device', {
    DeviceID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    UserID: { type: Sequelize.INTEGER, allowNull: false },
    DeviceName: { type: Sequelize.STRING, allowNull: false },
    DeviceType: { type: Sequelize.STRING, allowNull: false },
    CreatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    Room1Power: { type: Sequelize.FLOAT, defaultValue: 0 }, // Добавлено
    Room2Power: { type: Sequelize.FLOAT, defaultValue: 0 }, // Добавлено
}, {
    timestamps: false,
});


// Модель логов устройства
const DeviceLog = sequelize.define('DeviceLog', {
    LogID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    DeviceID: { type: Sequelize.INTEGER, allowNull: false },
    Room1Power: { type: Sequelize.FLOAT, allowNull: false },
    Room2Power: { type: Sequelize.FLOAT, allowNull: false },
    MaxPower: { type: Sequelize.FLOAT, allowNull: false },
    CreatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
}, {
    timestamps: false,
});

// Модель уведомлений
const Notification = sequelize.define('Notification', {
    NotificationID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    UserID: { type: Sequelize.INTEGER, allowNull: false },
    DeviceID: { type: Sequelize.INTEGER, allowNull: false },
    Message: { type: Sequelize.STRING, allowNull: false },
    IsRead: { type: Sequelize.BOOLEAN, defaultValue: false },
    CreatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
}, {
    timestamps: false,
});

// Модель настроек устройств
const Setting = sequelize.define('Setting', {
    SettingID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    DeviceID: { type: Sequelize.INTEGER, allowNull: false },
    MaxPower: { type: Sequelize.FLOAT, defaultValue: 500 },
    UpdatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
}, {
    timestamps: false,
});

// Связи между таблицами
User.hasMany(Device, { foreignKey: 'UserID' });
Device.belongsTo(User, { foreignKey: 'UserID' });

Device.hasMany(DeviceLog, { foreignKey: 'DeviceID' });
DeviceLog.belongsTo(Device, { foreignKey: 'DeviceID' });

Device.hasMany(Notification, { foreignKey: 'DeviceID' });
Notification.belongsTo(Device, { foreignKey: 'DeviceID' });

Device.hasOne(Setting, { foreignKey: 'DeviceID' });
Setting.belongsTo(Device, { foreignKey: 'DeviceID' });

module.exports = { sequelize, User, Device, DeviceLog, Notification, Setting };
