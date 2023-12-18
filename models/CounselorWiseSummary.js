const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const CounselorWiseSummary = sequelize.define('CounselorWiseSummary', {
  Month: {
    type: DataTypes.STRING,
  },
  LeadID: {
    type: DataTypes.STRING,
  },
  LeadCreationDate: {
    type: DataTypes.DATE,
  },
  ExecutiveName: {
    type: DataTypes.STRING,
  },
  Team: {
    type: DataTypes.STRING,
  },
  StudentName: {
    type: DataTypes.STRING,
  },
  CourseShortName: {
    type: DataTypes.STRING,
  },
  Specialization: {
    type: DataTypes.STRING,
  },
  AmountReceived: {
    type: DataTypes.INTEGER,
  },
  DiscountAmount: {
    type: DataTypes.INTEGER,
  },
  DiscountReason: {
    type: DataTypes.STRING,
  },
  StudyMaterial: {
    type: DataTypes.STRING,
  },
  StudyMaterialDiscount: {
    type: DataTypes.STRING,
  },
  AmountBilled: {
    type: DataTypes.INTEGER,
  },
  PaymentMode: {
    type: DataTypes.STRING,
  },
  Accountdetails: {
    type: DataTypes.STRING,
  },
  PaymentOption: {
    type: DataTypes.STRING,
  },
  SaleDate: {
    type: DataTypes.DATE,
  },
  ContactNumber: {
    type: DataTypes.STRING,
  },
  EmailID: {
    type: DataTypes.STRING,
  },
  Sourcetype: {
    type: DataTypes.STRING,
  },
  Team2: {
    type: DataTypes.STRING,
  },
  PrimarySource: {
    type: DataTypes.STRING,
  },
  SecondarySource: {
    type: DataTypes.STRING,
  },
  LeadID2: {
    type: DataTypes.STRING,
  },
  Source: {
    type: DataTypes.STRING,
  },
  AgencySource: {
    type: DataTypes.STRING,
  },
  '1st payment amt': {
    type: DataTypes.INTEGER,
  },

  EnrollmentId: {
    type: DataTypes.STRING,
  },
  Cohort: {
    type: DataTypes.STRING,
  },
  SecondarySource2: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: false,
});


module.exports = CounselorWiseSummary;