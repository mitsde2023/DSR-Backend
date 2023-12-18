const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const CounselorWiseSummary = require('./CounselorWiseSummary');

const CounselorData = sequelize.define('CounselorData', {
  Counselor: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true, // Ensure the column is unique
  },
  Month: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TeamLeaders: {
    type: DataTypes.STRING,
  },
  TeamManager: {
    type: DataTypes.STRING,
  },
  SalesManager: {
    type: DataTypes.STRING,
  },
  Role: {
    type: DataTypes.STRING,
  },
  Team: {
    type: DataTypes.STRING,
  },
  Status: {
    type: DataTypes.STRING,
  },
  Target: {
    type: DataTypes.INTEGER,
  },
  TotalLead: {
    type: DataTypes.INTEGER,
  },
  ConnectedCall: {
    type: DataTypes.INTEGER,
  },
  TalkTime: {
    type: DataTypes.STRING,
  },
  Final: {
    type: DataTypes.STRING,
  },
  Group: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['Counselor', 'Month'], // Index on Counselor and Month columns
    },
  ],
});

CounselorData.hasMany(CounselorWiseSummary, {
  foreignKey: 'ExecutiveName',
  sourceKey: 'Counselor',
});

module.exports = CounselorData;
