// const { DataTypes } = require('sequelize');
// const sequelize = require('../config');

// const CounselorWiseTeam = sequelize.define('CounselorWiseTeam', {
//     ExecutiveName: {
//         type: DataTypes.STRING,
//         allowNull: false, // Assuming this field is required
//     },
//     TeamLeaders: {
//         type: DataTypes.STRING,
//     },
//     TeamManager: {
//         type: DataTypes.STRING,
//     },
//     AsstManagers: {
//         type: DataTypes.STRING,
//     },
//     Team: {
//         type: DataTypes.STRING,
//         allowNull: false, // Assuming this field is required
//     },
//     HC: {
//         type: DataTypes.STRING,
//     },
//     Group: {
//         type: DataTypes.STRING,
//     },
//     Month: {
//         type: DataTypes.STRING,
//         allowNull: false, // Assuming this field is required
//     },
// });

// // Sync the model with the database (create the table if it doesn't exist)
// CounselorWiseTeam.sync()
//     .then(() => {
//         console.log('CounselorWiseTeam model synchronized with the database');
//     })
//     .catch((error) => {
//         console.error('Error synchronizing model:', error);
//     });

// module.exports = CounselorWiseTeam;
