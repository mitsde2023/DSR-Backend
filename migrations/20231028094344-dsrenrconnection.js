'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column already exists in the table
    const exists = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM CounselorWiseSummaries LIKE 'ExecutiveName';`
    );

    // If the column doesn't exist, add it
    if (exists[0].length === 0) {
      return queryInterface.addColumn('CounselorWiseSummaries', 'ExecutiveName', {
        type: Sequelize.STRING,
        allowNull: true, // Modify allowNull as needed
      });
    }

    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the column if needed
    return queryInterface.removeColumn('CounselorWiseSummaries', 'ExecutiveName');
  }
};
