const express = require('express');
const router = express.Router();
const CounselorData = require('../models/CounselorData');
const CounselorWiseSummary = require('../models/CounselorWiseSummary');

router.delete('/deleteAllRecords', async (req, res) => {
  try {
    await CounselorWiseSummary.destroy({
      where: {},
      truncate: true, 
    });

    await CounselorData.destroy({
      where: {},
      truncate: true,
    });

    res.status(200).json({ message: 'All records deleted successfully.' });
  } catch (error) {
    console.error('Error deleting records:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
