const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
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

router.get('/counselor-metrics', async (req, res) => {
  try {
    // console.log(req.query, 9);
    let whereClause = {};
    let monthClause = {};
    const salesManager = req.query.selectedSalesManager;
    const teamManager = req.query.selectedTeamManager;
    const teamLeader = req.query.selectedTeamLeader;
    const selectedMonth = req.query.selectedMonth

    if (selectedMonth) {
      whereClause.Month = selectedMonth;
      monthClause.Month = selectedMonth;
    }
    if (salesManager) {
      whereClause.SalesManager = salesManager;
      whereClause.Month = selectedMonth;
    }

    if (teamManager) {
      whereClause.TeamManager = teamManager;
      whereClause.SalesManager = salesManager;
      whereClause.Month = selectedMonth;
    }

    if (teamLeader) {
      whereClause.TeamLeaders = teamLeader;
      whereClause.TeamManager = teamManager;
      whereClause.SalesManager = salesManager;
      whereClause.Month = selectedMonth;

    }
    const counselorMetrics = await CounselorData.findAll({
      include: [
        {
          model: CounselorWiseSummary,
          required: false,
          attributes: ['AmountReceived', 'AmountBilled', 'Specialization', 'SaleDate'],
          where: monthClause
        },
      ],
      attributes: [
        'Counselor',
        'TeamLeaders',
        'TeamManager',
        'SalesManager',
        'Role',
        'Team',
        'Status',
        'Target',
        'TotalLead',
        'ConnectedCall',
        'TalkTime',
        'Final',
        'Group',
      ],
      where: whereClause,
    });

    const result = [];
    counselorMetrics.forEach((counselor) => {
      const AmountReceivedSum = counselor.CounselorWiseSummaries.reduce((sum, summary) => {
        return sum + (summary.AmountReceived || 0);
      }, 0);

      const AmountBilledSum = counselor.CounselorWiseSummaries.reduce((sum, summary) => {
        return sum + (summary.AmountBilled || 0);
      }, 0);

      result.push({
        ...counselor.toJSON(),
        Admissions: counselor.CounselorWiseSummaries.length,
        CollectedRevenue: AmountReceivedSum,
        BilledRevenue: AmountBilledSum,
      });
    });

    res.json(result);

  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


async function HirrachicalData(selectedMonth, salesManager, teamManager, teamLeader) {
  // console.log(salesManager, teamManager, teamLeader, 622);
  try {
    let whereClause = {};
    let monthClause = {};

    if (selectedMonth.length) {
      whereClause.Month = selectedMonth;
      monthClause.Month = selectedMonth;
    }
    if (salesManager) {
      whereClause.SalesManager = salesManager;
      whereClause.Month = selectedMonth;
    }

    if (teamManager) {
      whereClause.TeamManager = teamManager;
      whereClause.SalesManager = salesManager;
      whereClause.Month = selectedMonth;
    }

    if (teamLeader) {
      whereClause.TeamLeaders = teamLeader;
      whereClause.TeamManager = teamManager;
      whereClause.SalesManager = salesManager;
      whereClause.Month = selectedMonth;

    }

    const counselorMetrics = await CounselorData.findAll({
      include: [
        {
          model: CounselorWiseSummary,
          required: false,
          attributes: ['AmountReceived', 'AmountBilled', 'Specialization', 'SaleDate'],
          where: monthClause
        },
      ],
      attributes: [
        'Counselor',
        'TeamLeaders',
        'TeamManager',
        'SalesManager',
        'Role',
        'Team',
        'Status',
        'Target',
        'TotalLead',
        'ConnectedCall',
        'TalkTime',
        'Final',
        'Group',
      ],
      where: whereClause,
    });


    const result = [];
    counselorMetrics.forEach((counselor) => {
      const AmountReceivedSum = counselor.CounselorWiseSummaries.reduce((sum, summary) => {
        return sum + (summary.AmountReceived || 0);
      }, 0);

      const AmountBilledSum = counselor.CounselorWiseSummaries.reduce((sum, summary) => {
        return sum + (summary.AmountBilled || 0);
      }, 0);

      result.push({
        ...counselor.toJSON(),
        Admissions: counselor.CounselorWiseSummaries.length,
        CollectedRevenue: AmountReceivedSum,
        BilledRevenue: AmountBilledSum,
      });
    });

    return result;
  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    throw error;
  }
}

async function getHierarchicalData(data) {
  const hierarchy = {};

  for (const counselorData of data) {

    const salesManager = counselorData.SalesManager;
    const teamManager = counselorData.TeamManager;
    const teamLeaders = counselorData.TeamLeaders;
    const counselor = counselorData.Counselor;
    const group = counselorData.Group;

    if (!hierarchy[salesManager]) {
      hierarchy[salesManager] = {

      };
    }

    if (!hierarchy[salesManager][teamManager]) {
      hierarchy[salesManager][teamManager] = {

      };
    }

    if (!hierarchy[salesManager][teamManager][teamLeaders]) {
      hierarchy[salesManager][teamManager][teamLeaders] = [];
    }

    hierarchy[salesManager][teamManager][teamLeaders].push({
      counselor,
      group,
    });
  }

  return hierarchy;
}

// async function getUniqueMonths() {
//   try {
//     // Use Sequelize to find distinct months from the CounselorData model
//     const uniqueMonths = await CounselorData.findAll({
//       attributes: [
//         [Sequelize.fn('DISTINCT', Sequelize.col('Month')), 'Month'],
//       ],
//       raw: true,
//     });

//     // Extract the 'Month' property from each result object and return as an object
//     const uniqueMonthsObject = {};
//     uniqueMonths.forEach(entry => {  
//       uniqueMonthsObject[entry.Month] = entry.Month;
//     });

//     return uniqueMonthsObject;
//   } catch (error) {
//     console.error('Error fetching unique months:', error);
//     throw error;
//   }
// }

async function getUniqueMonths() {
  try {
    // Use Sequelize to find distinct months from the CounselorData model
    const uniqueMonths = await CounselorData.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('Month')), 'Month'],
      ],
      raw: true,
    });

    // Create an array of objects with the desired structure
    const result = uniqueMonths.map((entry, index) => ({
      id: index + 1, // Assign a unique ID, you can adjust this based on your requirements
      month: entry.Month,
    }));

    return result;
  } catch (error) {
    console.error('Error fetching unique months:', error);
    throw error;
  }
}


router.get('/hierarchical-data-filter', async (req, res) => {
  try {
    const { selectedMonth } = req.query;
    console.log(selectedMonth, 258)
    const uniqueMonths = await getUniqueMonths();

    if (selectedMonth.length > 1) {
      const counselorMetrics = await CounselorData.findAll({
        attributes: [
          'Counselor',
          'TeamLeaders',
          'TeamManager',
          'SalesManager',
          'Group',
        ],
        where: { Month: selectedMonth }
      });
      const hierarchicalData = await getHierarchicalData(counselorMetrics);
      res.json({ uniqueMonths, hierarchicalData });

    } else {
      const counselorMetrics = await CounselorData.findAll({
        attributes: [
          'Counselor',
          'TeamLeaders',
          'TeamManager',
          'SalesManager',
          'Group',
        ],
        // where: { Month: selectedMonth }
      });
      const hierarchicalData = await getHierarchicalData(counselorMetrics);
      res.json({ uniqueMonths, hierarchicalData });

    }

    // console.log(hierarchicalData);

    // res.json(hierarchicalData);

  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function organizeData(data) {
  const result = {
    SalesManagers: {},
  };

  for (const counselor of data) {
    const SalesManager = counselor.SalesManager;
    const TeamManager = counselor.TeamManager;
    const TeamLeader = counselor.TeamLeaders;

    if (!result.SalesManagers[SalesManager]) {
      // Create SalesManager if not exists
      result.SalesManagers[SalesManager] = {
        Target: 0,
        TotalLead: 0,
        Admissions: 0,
        CollectedRevenue: 0,
        BilledRevenue: 0,
        TeamManagers: {},
        TeamManagerCount: 0,
        TeamLeaderCount: 0,
        SalesManagerCount: 0,
      };
    }

    if (!result.SalesManagers[SalesManager].TeamManagers[TeamManager]) {
      // Create TeamManager if not exists under SalesManager
      result.SalesManagers[SalesManager].TeamManagers[TeamManager] = {
        Target: 0,
        TotalLead: 0,
        Admissions: 0,
        CollectedRevenue: 0,
        BilledRevenue: 0,
        TeamLeaders: {},
        TeamLeaderCount: 0,
        TeamManagerCount: 0,
      };
      result.SalesManagers[SalesManager].TeamManagerCount += 1;
    }

    if (!result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaders[TeamLeader]) {
      // Create TeamLeader if not exists under TeamManager
      result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaders[TeamLeader] = {
        Target: 0,
        TotalLead: 0,
        Admissions: 0,
        CollectedRevenue: 0,
        BilledRevenue: 0,
        TeamLeaderCounselorCount: 0, // Initialize the counselor count to 0
      };
      result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaderCount += 1;
    }

    // Update data
    result.SalesManagers[SalesManager].Target += counselor.Target;
    result.SalesManagers[SalesManager].TotalLead += counselor.TotalLead;
    result.SalesManagers[SalesManager].Admissions += counselor.Admissions;
    result.SalesManagers[SalesManager].CollectedRevenue += counselor.CollectedRevenue;
    result.SalesManagers[SalesManager].BilledRevenue += counselor.BilledRevenue;

    result.SalesManagers[SalesManager].TeamManagers[TeamManager].Target += counselor.Target;
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].TotalLead += counselor.TotalLead;
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].Admissions += counselor.Admissions;
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].CollectedRevenue += counselor.CollectedRevenue;
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].BilledRevenue += counselor.BilledRevenue;

    result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaders[TeamLeader].Target += counselor.Target;
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaders[TeamLeader].TotalLead += counselor.TotalLead;
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaders[TeamLeader].Admissions += counselor.Admissions;
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaders[TeamLeader].CollectedRevenue += counselor.CollectedRevenue;
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaders[TeamLeader].BilledRevenue += counselor.BilledRevenue;

    // Increase the counselor count for the specific TeamLeader
    result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamLeaders[TeamLeader].TeamLeaderCounselorCount += 1;

    // Increment TeamLeaderCount under SalesManager
    result.SalesManagers[SalesManager].TeamLeaderCount += 1;

    // Increment TeamManagerCount under TeamManager (without self count)
    if (TeamManager !== SalesManager) {
      result.SalesManagers[SalesManager].TeamManagers[TeamManager].TeamManagerCount += 1;
    }
  }

  // Calculate Sales Managers, Team Managers, and Team Leader counts based on actual counts
  for (const salesManagerName in result.SalesManagers) {
    const managerData = result.SalesManagers[salesManagerName];
    managerData.SalesManagerCount = 1;

    for (const teamManagerName in managerData.TeamManagers) {
      const teamManagerData = managerData.TeamManagers[teamManagerName];
      teamManagerData.TeamManagerCount = 1;

      for (const teamLeaderName in teamManagerData.TeamLeaders) {
        teamManagerData.TeamManagerCount += teamManagerData.TeamLeaders[teamLeaderName].TeamLeaderCounselorCount;
        managerData.SalesManagerCount += teamManagerData.TeamManagerCount;
      }
    }
  }

  return result;
}




router.get('/counselor-data-hir', async (req, res) => {
  try {
    const counselorData = await HirrachicalData();
    const organizedData = await organizeData(counselorData);
    res.json(organizedData);
  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


async function formatData(response) {
  const formattedData = [];

  const res = response;

  if (res && res.SalesManagers) {
    for (const managerName in res.SalesManagers) {
      const manager = res.SalesManagers[managerName];
      for (const teamManagerName in manager.TeamManagers) {
        const teamManager = manager.TeamManagers[teamManagerName];
        for (const teamLeaderName in teamManager.TeamLeaders) {
          const teamLeader = teamManager.TeamLeaders[teamLeaderName];
          const admissions = teamLeader.Admissions;
          const target = teamLeader.Target;
          const totalLead = teamLeader.TotalLead;
          const percentAchieve = (admissions / target) * 100;
          const conversionPercent = (admissions / totalLead) * 100;
          const teamLeaderCounselorCount = teamLeader.TeamLeaderCounselorCount; // New addition


          formattedData.push({
            'AsstManager': managerName,
            'TeamManager': teamManagerName,
            'TeamLeader': teamLeaderName,
            'TeamLeaderCounselorCount': teamLeaderCounselorCount,
            'Target': target,
            'Admissions': admissions,
            '%Achieve': percentAchieve.toFixed(2),
            'T-Lead': totalLead,
            'Conversion%': conversionPercent.toFixed(2),
            'Coll-Revenue': teamLeader.CollectedRevenue,
            'Bill-Revenue': teamLeader.BilledRevenue,
            'C_PSR': (teamLeader.CollectedRevenue / admissions).toFixed(2),
            'B_PSR': (teamLeader.BilledRevenue / admissions).toFixed(2),
            'C_PCR': (teamLeader.CollectedRevenue / teamLeaderCounselorCount).toFixed(2),
            'B_PCR': (teamLeader.BilledRevenue / teamLeaderCounselorCount).toFixed(2),
            'PCE': Number((admissions / teamLeaderCounselorCount).toFixed(2))
          });
        }
        // Check if the TeamManager is not the same as the AsstManager, then add a new row
        if (managerName !== teamManagerName) {
          formattedData.push({
            'AsstManager': managerName,
            'TeamManager': teamManagerName,
            'TeamLeaderCounselorCount': teamManager.TeamManagerCount - 1,
            'Target': teamManager.Target,
            'Admissions': teamManager.Admissions,
            '%Achieve': ((teamManager.Admissions / teamManager.Target).toFixed(2) * 100).toFixed(2),
            'T-Lead': teamManager.TotalLead,
            'Conversion%': ((teamManager.Admissions / teamManager.TotalLead).toFixed(2) * 100).toFixed(2),
            'Coll-Revenue': teamManager.CollectedRevenue,
            'Bill-Revenue': teamManager.BilledRevenue,
            'C_PSR': (teamManager.CollectedRevenue / teamManager.Admissions).toFixed(2),
            'B_PSR': (teamManager.BilledRevenue / teamManager.Admissions).toFixed(2),
            'C_PCR': (teamManager.CollectedRevenue / (teamManager.TeamManagerCount - 1)).toFixed(2),
            'B_PCR': (teamManager.BilledRevenue / (teamManager.TeamManagerCount - 1)).toFixed(2),
            'PCE': Number((teamManager.Admissions / (teamManager.TeamManagerCount - 1)).toFixed(2))
          });
        }

      }
      formattedData.push({
        'AsstManager': managerName,
        'TeamLeaderCounselorCount': manager.TeamLeaderCount,
        'Target': manager.Target,
        'Admissions': manager.Admissions,
        '%Achieve': ((manager.Admissions / manager.Target) * 100).toFixed(2),
        'T-Lead': manager.TotalLead,
        'Conversion%': ((manager.Admissions / manager.TotalLead).toFixed(2) * 100).toFixed(2),
        'Coll-Revenue': manager.CollectedRevenue,
        'Bill-Revenue': manager.BilledRevenue,
        'C_PSR': (manager.CollectedRevenue / manager.Admissions).toFixed(2),
        'B_PSR': (manager.BilledRevenue / manager.Admissions).toFixed(2),
        'C_PCR': (manager.CollectedRevenue / manager.TeamLeaderCount).toFixed(2),
        'B_PCR': (manager.BilledRevenue / manager.TeamLeaderCount).toFixed(2),
        'PCE': Number((manager.Admissions / manager.TeamLeaderCount).toFixed(2))
      });
    }
  }
  return formattedData;
}




async function assignRank(data) {
  const rankings = {
    AsstManager: {},
    TeamManager: {},
    TeamLeader: {},
  };

  for (const role in rankings) {
    rankings[role] = {
      data: data.filter((item) => item[role] !== undefined),
      rank: 1,
    };
  }

  for (const role in rankings) {
    rankings[role].data.sort((a, b) => b.Admissions - a.Admissions);
  }

  for (const role in rankings) {
    let rank = 1;
    for (let i = 0; i < rankings[role].data.length; i++) {
      const item = rankings[role].data[i];
      item.Rank = rank;
      rank++;
    }
  }

  const rankedData = data.map((item) => {
    const presentRoles = ['AsstManager', 'TeamManager', 'TeamLeader'].filter(
      (role) => item[role] !== undefined
    );

    if (
      (presentRoles.includes('TeamManager') && presentRoles.includes('TeamLeader') &&
        item.TeamManager === item.TeamLeader) ||
      (presentRoles.includes('AsstManager') && presentRoles.includes('TeamManager') &&
        presentRoles.includes('TeamLeader') &&
        item.AsstManager === item.TeamManager && item.TeamManager === item.TeamLeader) || (presentRoles.includes('AsstManager') &&
          item.AsstManager === "Pravin Patare")
    ) {
      item.Rank = '';
    } else {
      let roleRanks = presentRoles.map((role) => {
        return { role, rank: item[role] ? rankings[role].data.find((x) => x === item) : null };
      });

      roleRanks = roleRanks.filter((entry) => entry.rank);

      if (roleRanks.length > 1) {
        roleRanks.sort((a, b) => (a.rank.Rank > b.rank.Rank ? 1 : -1));
      }
      // Set the last rank to rank-1
      item.Rank = roleRanks.length > 0 ? roleRanks[0].rank.Rank : 0;
      if ((item.Rank > 22) && (presentRoles.includes('TeamManager') &&
        presentRoles.includes('TeamLeader') &&
        presentRoles.includes('AsstManager') &&
        item.TeamManager !== item.TeamLeader &&
        item.AsstManager !== item.TeamManager &&
        item.AsstManager !== item.TeamLeader)) {
        item.Rank = item.Rank - 1;
      }
    }

    return item;
  });

  return rankedData;
}








router.get('/react-table-data', async (req, res) => {
  try {

    const { selectedMonth, selectedSalesManager, selectedTeamManager, selectedTeamLeader } = req.query; // Use req.query instead of req.params
    console.log(selectedSalesManager, selectedTeamManager, selectedTeamLeader, selectedMonth, 711)
    const counselorData = await HirrachicalData(selectedMonth, selectedSalesManager, selectedTeamManager, selectedTeamLeader);
    const organizedData = await organizeData(counselorData);
    const formattedData = await formatData(organizedData);
    const dataWithRanking = await assignRank(formattedData);
    res.json(dataWithRanking);
  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


async function TltmData(data) {
  try {
    const filteredData = data.filter(
      (counselor) =>
        counselor.Role === 'Team Leaders' || counselor.Role === 'TeamManager'
    );
    return filteredData;
  } catch (error) {
    console.log(error);
  }
}


async function TltmReStruData(originalData) {
  try {
    const transformedData = originalData.map((item) => {
      const {
        Counselor,
        TeamLeaders,
        TeamManager,
        SalesManager,
        Target,
        TotalLead,
        Admissions,
        CollectedRevenue,
        BilledRevenue,
      } = item;

      const headCount = 1;
      const C_PSR = (CollectedRevenue / Admissions).toFixed(2);
      const B_PSR = (BilledRevenue / Admissions).toFixed(2);
      const C_PCR = (CollectedRevenue / headCount).toFixed(2);
      const B_PCR = (BilledRevenue / headCount).toFixed(2);
      const percentageAchieve = ((Admissions / Target) * 100).toFixed(2);
      const percentageConversion = ((Admissions / TotalLead) * 100).toFixed(2);
      const PCE = Admissions / headCount;

      return {
        Counselor,
        TeamLeaders,
        TeamManager,
        SalesManager,
        Target,
        TotalLead,
        Admissions,
        CollectedRevenue,
        BilledRevenue,
        headCount,
        "%Achieve": percentageAchieve,
        "%Conversion": percentageConversion,
        C_PSR: C_PSR,
        B_PSR: B_PSR,
        C_PCR: C_PCR,
        B_PCR: B_PCR,
        PCE: PCE,
      };
    });
    transformedData.sort((a, b) => {
      if (a.SalesManager < b.SalesManager) return -1;
      if (a.SalesManager > b.SalesManager) return 1;
      if (a.TeamManager < b.TeamManager) return -1;
      if (a.TeamManager > b.TeamManager) return 1;
      if (a.Counselor < b.Counselor) return -1;
      if (a.Counselor > b.Counselor) return 1;
      return 0;
    });

    // Sort the data as you specified
    transformedData.sort((a, b) => {
      if (a.SalesManager < b.SalesManager) return -1;
      if (a.SalesManager > b.SalesManager) return 1;
      if (a.TeamManager < b.TeamManager) return -1;
      if (a.TeamManager > b.TeamManager) return 1;
      if (a.Counselor < b.Counselor) return -1;
      if (a.Counselor > b.Counselor) return 1;
      return 0;
    });

    // Calculate the Grand Total
    const grandTotal = {
      Counselor: "",
      TeamLeaders: "",
      TeamManager: "Grand Total",
      SalesManager: "",
      Target: 0,
      TotalLead: 0,
      Admissions: 0,
      CollectedRevenue: 0,
      BilledRevenue: 0,
      headCount: 0,
      "%Achieve": 0,
      "%Conversion": 0,
      C_PSR: 0,
      B_PSR: 0,
      C_PCR: 0,
      B_PCR: 0,
      PCE: 0,
    };

    // Calculate the totals
    transformedData.forEach((item) => {
      for (const key in grandTotal) {
        if (key !== "Counselor" && key !== "TeamLeaders" && key !== "TeamManager" && key !== "SalesManager") {
          grandTotal[key] += parseFloat(item[key]);
        }
      }
    });

    // Recalculate the fields for Grand Total
    grandTotal["%Achieve"] = ((grandTotal.Admissions / grandTotal.Target) * 100).toFixed(2);
    grandTotal["%Conversion"] = ((grandTotal.Admissions / grandTotal.TotalLead) * 100).toFixed(2);
    grandTotal.C_PSR = (grandTotal.CollectedRevenue / grandTotal.Admissions).toFixed(2);
    grandTotal.B_PSR = (grandTotal.BilledRevenue / grandTotal.Admissions).toFixed(2);
    grandTotal.C_PCR = (grandTotal.CollectedRevenue / grandTotal.headCount).toFixed(2);
    grandTotal.B_PCR = (grandTotal.BilledRevenue / grandTotal.headCount).toFixed(2);
    grandTotal.PCE = (grandTotal.Admissions / grandTotal.headCount).toFixed(2);

    transformedData.push(grandTotal);

    return transformedData;
  } catch (error) {
    console.log(error);
  }
}




router.get('/tltm-in', async (req, res) => {
  try {
    const { selectedMonth, selectedSalesManager, selectedTeamManager, selectedTeamLeader } = req.query;
    const counselorData = await HirrachicalData(selectedMonth, selectedSalesManager, selectedTeamManager, selectedTeamLeader);
    const tltmdata = await TltmData(counselorData);
    const reStruTltm = await TltmReStruData(tltmdata)
    console.log(reStruTltm.length)
    res.json(reStruTltm);
  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function ExcludingTL(originalData) {
  try {
    const filteredData = originalData.filter((item) =>
      item.Role === "Counselor" &&
      item.Counselor !== item.TeamManager &&
      item.Counselor !== item.SalesManager
    );

    // Group data by "TeamLeaders" and calculate totals
    const groupByTeamLeaders = {};

    filteredData.forEach((item) => {
      const { TeamLeaders } = item;

      if (TeamLeaders in groupByTeamLeaders) {
        // Add the current item's values to the existing group
        const group = groupByTeamLeaders[TeamLeaders];
        group.Admissions += item.Admissions;
        group.CollectedRevenue += item.CollectedRevenue;
        group.BilledRevenue += item.BilledRevenue;
        group.headCount += 1; // Increment the headCount for each counselor
        group.Target += item.Target;
        group.TotalLead += item.TotalLead;
      } else {
        // Initialize a new group for the TeamLeaders
        groupByTeamLeaders[TeamLeaders] = {
          Counselor: item.Counselor,
          TeamLeaders: item.TeamLeaders,
          TeamManager: item.TeamManager,
          SalesManager: item.SalesManager,
          Target: item.Target,
          TotalLead: item.TotalLead,
          Admissions: item.Admissions,
          CollectedRevenue: item.CollectedRevenue,
          BilledRevenue: item.BilledRevenue,
          headCount: 1,
        };
      }
    });

    // Convert the grouped data object back to an array
    const transformedData = Object.values(groupByTeamLeaders);

    return transformedData;
  } catch (error) {
    console.log(error);
  }
}

async function calculateFields(data) {
  const calculatedData = data.map(item => {
    const { Admissions, Target, TotalLead, CollectedRevenue, BilledRevenue, headCount } = item;

    return {
      Counselor: item.Counselor,
      TeamLeaders: item.TeamLeaders,
      TeamManager: item.TeamManager,
      SalesManager: item.SalesManager,
      Target,
      TotalLead,
      Admissions,
      AmountReceived: CollectedRevenue,
      AmountBilled: BilledRevenue,
      headCount: headCount,
      "%Achieve": ((Admissions / Target) * 100).toFixed(2),
      "%Conversion": ((Admissions / TotalLead) * 100).toFixed(2),
      C_PSR: (CollectedRevenue / Admissions).toFixed(2),
      B_PSR: (BilledRevenue / Admissions).toFixed(2),
      C_PCR: (CollectedRevenue / headCount).toFixed(2),
      B_PCR: (BilledRevenue / headCount).toFixed(2),
      PCE: (Admissions / headCount).toFixed(2)
    };
  });

  calculatedData.sort((a, b) => a.TeamManager.localeCompare(b.TeamManager) || a.SalesManager.localeCompare(b.SalesManager));
  const result = [];
  let currentSalesManager = null;
  let salesManagerTotal = {
    Counselor: "Sales Manager Total",
    TeamLeaders: "",
    TeamManager: "",
    SalesManager: "",
    Target: 0,
    TotalLead: 0,
    Admissions: 0,
    AmountReceived: 0,
    AmountBilled: 0,
    headCount: 0,
    "%Achieve": "",
    "%Conversion": "",
    C_PSR: "",
    B_PSR: "",
    C_PCR: "",
    B_PCR: "",
    PCE: ""
  };

  let grandTotal = {
    Counselor: " Grand",
    TeamLeaders: "",
    TeamManager: "",
    SalesManager: " Grand",
    Target: 0,
    TotalLead: 0,
    Admissions: 0,
    AmountReceived: 0,
    AmountBilled: 0,
    headCount: 0,
    "%Achieve": "",
    "%Conversion": "",
    C_PSR: "",
    B_PSR: "",
    C_PCR: "",
    B_PCR: "",
    PCE: ""
  };

  for (const item of calculatedData) {
    if (currentSalesManager !== item.SalesManager) {
      // If we encounter a new SalesManager, push the current salesManagerTotal to the result array
      if (currentSalesManager) {
        // Calculate fields for the salesManagerTotal
        salesManagerTotal["%Achieve"] = ((salesManagerTotal.Admissions / salesManagerTotal.Target) * 100).toFixed(2);
        salesManagerTotal["%Conversion"] = ((salesManagerTotal.Admissions / salesManagerTotal.TotalLead) * 100).toFixed(2);
        salesManagerTotal["C_PSR"] = (salesManagerTotal.AmountReceived / salesManagerTotal.Admissions).toFixed(2);
        salesManagerTotal["B_PSR"] = (salesManagerTotal.AmountBilled / salesManagerTotal.Admissions).toFixed(2);
        salesManagerTotal["C_PCR"] = (salesManagerTotal.AmountReceived / salesManagerTotal.headCount).toFixed(2);
        salesManagerTotal["B_PCR"] = (salesManagerTotal.AmountBilled / salesManagerTotal.headCount).toFixed(2);
        salesManagerTotal["PCE"] = (salesManagerTotal.Admissions / salesManagerTotal.headCount).toFixed(2);

        result.push(salesManagerTotal);
      }
      currentSalesManager = item.SalesManager;
      salesManagerTotal = { ...salesManagerTotal, SalesManager: currentSalesManager };

      // Reset the total values for the new SalesManager
      salesManagerTotal.Target = 0;
      salesManagerTotal.TotalLead = 0;
      salesManagerTotal.Admissions = 0;
      salesManagerTotal.AmountReceived = 0;
      salesManagerTotal.AmountBilled = 0;
      salesManagerTotal.headCount = 0;
    }

    if (item.SalesManager) {
      // Update salesManagerTotal with data from the current row
      salesManagerTotal.Target += item.Target;
      salesManagerTotal.TotalLead += item.TotalLead;
      salesManagerTotal.Admissions += item.Admissions;
      salesManagerTotal.AmountReceived += item.AmountReceived;
      salesManagerTotal.AmountBilled += item.AmountBilled;
      salesManagerTotal.headCount += item.headCount;

      // Update the grand total with data from the current row
      grandTotal.Target += item.Target;
      grandTotal.TotalLead += item.TotalLead;
      grandTotal.Admissions += item.Admissions;
      grandTotal.AmountReceived += item.AmountReceived;
      grandTotal.AmountBilled += item.AmountBilled;
      grandTotal.headCount += item.headCount;
    }

    // Push the current row to the result array
    result.push(item);
  }

  // Push the last salesManagerTotal to the result array
  if (currentSalesManager) {
    // Calculate fields for the last salesManagerTotal
    salesManagerTotal["%Achieve"] = ((salesManagerTotal.Admissions / salesManagerTotal.Target) * 100).toFixed(2);
    salesManagerTotal["%Conversion"] = ((salesManagerTotal.Admissions / salesManagerTotal.TotalLead) * 100).toFixed(2);
    salesManagerTotal["C_PSR"] = (salesManagerTotal.AmountReceived / salesManagerTotal.Admissions).toFixed(2);
    salesManagerTotal["B_PSR"] = (salesManagerTotal.AmountBilled / salesManagerTotal.Admissions).toFixed(2);
    salesManagerTotal["C_PCR"] = (salesManagerTotal.AmountReceived / salesManagerTotal.headCount).toFixed(2);
    salesManagerTotal["B_PCR"] = (salesManagerTotal.AmountBilled / salesManagerTotal.headCount).toFixed(2);
    salesManagerTotal["PCE"] = (salesManagerTotal.Admissions / salesManagerTotal.headCount).toFixed(2);

    result.push(salesManagerTotal);
  }

  // Calculate fields for the grand total
  grandTotal["%Achieve"] = ((grandTotal.Admissions / grandTotal.Target) * 100).toFixed(2);
  grandTotal["%Conversion"] = ((grandTotal.Admissions / grandTotal.TotalLead) * 100).toFixed(2);
  grandTotal["C_PSR"] = (grandTotal.AmountReceived / grandTotal.Admissions).toFixed(2);
  grandTotal["B_PSR"] = (grandTotal.AmountBilled / grandTotal.Admissions).toFixed(2);
  grandTotal["C_PCR"] = (grandTotal.AmountReceived / grandTotal.headCount).toFixed(2);
  grandTotal["B_PCR"] = (grandTotal.AmountBilled / grandTotal.headCount).toFixed(2);
  grandTotal["PCE"] = (grandTotal.Admissions / grandTotal.headCount).toFixed(2);

  // Push the grand total to the result array
  result.push(grandTotal);

  return result;
}

async function Ranking(data) {
  const rankings = {
    AsstManager: {},
    TeamManager: {},
    TeamLeader: {},
  };

  for (const role in rankings) {
    rankings[role] = {
      data: data.filter((item) => item[role] !== undefined && item[role] !== ""),
      rank: 1,
    };
  }

  for (const role in rankings) {
    rankings[role].data.sort((a, b) => b.PCE - a.PCE);
  }

  for (const role in rankings) {
    let rank = 1;
    for (let i = 0; i < rankings[role].data.length; i++) {
      const item = rankings[role].data[i];
      item.Rank = rank;
      rank++;
    }
  }

  const rankedData = data.map((item) => {
    const presentRoles = ['AsstManager', 'TeamManager', 'TeamLeader'].filter(
      (role) => item[role] !== undefined && item[role] !== ""
    );

    // Check if both TeamLeaders and TeamManager are null or empty
    if (presentRoles.length > 0) {
      let roleRanks = presentRoles.map((role) => {
        return { role, rank: item[role] ? rankings[role].data.find((x) => x === item) : null };
      });

      roleRanks = roleRanks.filter((entry) => entry.rank);

      // Check if all roles have the same rank
      const sameRank = roleRanks.every((entry) => entry.rank.Rank === roleRanks[0].rank.Rank);

      if (roleRanks.length > 1 && !sameRank) {
        roleRanks.sort((a, b) => (a.rank.Rank > b.rank.Rank ? 1 : -1));
      }

      item.Rank = roleRanks.length > 0 ? roleRanks[0].rank.Rank : '';
    }

    return item;
  });

  return rankedData;
}



router.get('/Excluding-TL', async (req, res) => {
  try {
    const { selectedMonth, selectedSalesManager, selectedTeamManager, selectedTeamLeader } = req.query;

    const counselorData = await HirrachicalData(selectedMonth, selectedSalesManager, selectedTeamManager, selectedTeamLeader);
    const excludeTl = await ExcludingTL(counselorData);
    const calStruTltm = await calculateFields(excludeTl)
    const rankingData = await Ranking(calStruTltm)
    console.log(rankingData.length)
    res.json(rankingData);
  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function calculateGroupTotals(data) {
  const groupTotals = {};

  data.forEach((item) => {
    const group = item.Group;

    if (!groupTotals[group]) {
      groupTotals[group] = {
        Group: group,
        MITSDE: 'MITSDE',
        Target: 0,
        TotalLead: 0,
        Admissions: 0,
        CollectedRevenue: 0,
        BilledRevenue: 0,
        headCount: 0
      };
    }

    groupTotals[group].Target += item.Target;
    groupTotals[group].TotalLead += item.TotalLead;
    groupTotals[group].Admissions += item.Admissions;
    groupTotals[group].CollectedRevenue += item.CollectedRevenue;
    groupTotals[group].BilledRevenue += item.BilledRevenue;
    groupTotals[group].headCount += 1;
  });

  // Calculate additional fields for each group
  for (const group in groupTotals) {
    const groupData = groupTotals[group];
    groupData["%Achieve"] = ((groupData.Admissions / groupData.Target) * 100).toFixed(2);
    groupData["%Conversion"] = ((groupData.Admissions / groupData.TotalLead) * 100).toFixed(2);
    groupData.C_PSR = (groupData.CollectedRevenue / groupData.Admissions).toFixed(2);
    groupData.B_PSR = (groupData.BilledRevenue / groupData.Admissions).toFixed(2);
    groupData.C_PCR = (groupData.CollectedRevenue / groupData.headCount).toFixed(2);
    groupData.B_PCR = (groupData.BilledRevenue / groupData.headCount).toFixed(2);
    groupData.PCE = (groupData.Admissions / groupData.headCount).toFixed(2);
  }

  // Calculate the grand total
  const grandTotal = {
    Group: "Grand Total",
    Target: 0,
    TotalLead: 0,
    Admissions: 0,
    CollectedRevenue: 0,
    BilledRevenue: 0,
    headCount: 0
  };

  Object.values(groupTotals).forEach((groupData) => {
    grandTotal.Target += groupData.Target;
    grandTotal.TotalLead += groupData.TotalLead;
    grandTotal.Admissions += groupData.Admissions;
    grandTotal.CollectedRevenue += groupData.CollectedRevenue;
    grandTotal.BilledRevenue += groupData.BilledRevenue;
    grandTotal.headCount += groupData.headCount;
  });

  grandTotal["%Achieve"] = ((grandTotal.Admissions / grandTotal.Target) * 100).toFixed(2);
  grandTotal["%Conversion"] = ((grandTotal.Admissions / grandTotal.TotalLead) * 100).toFixed(2);
  grandTotal.C_PSR = (grandTotal.CollectedRevenue / grandTotal.Admissions).toFixed(2);
  grandTotal.B_PSR = (grandTotal.BilledRevenue / grandTotal.Admissions).toFixed(2);
  grandTotal.C_PCR = (grandTotal.CollectedRevenue / grandTotal.headCount).toFixed(2);
  grandTotal.B_PCR = (grandTotal.BilledRevenue / grandTotal.headCount).toFixed(2);
  grandTotal.PCE = (grandTotal.Admissions / grandTotal.headCount).toFixed(2);

  const groupDataArray = Object.values(groupTotals);
  groupDataArray.push(grandTotal);

  return groupDataArray;
}

router.get('/api/unique-months', async (req, res) => {
  try {
    // Use Sequelize to find distinct months from the CounselorData model
    const uniqueMonths = await CounselorData.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('Month')), 'Month'],
      ],
      raw: true,
    });

    // Extract the 'Month' property from each result object and return as an object
    const uniqueMonthsObject = {};
    uniqueMonths.forEach(entry => {
      uniqueMonthsObject[entry.Month] = entry.Month;
    });

    res.json(uniqueMonthsObject);
  } catch (error) {
    console.error('Error fetching unique months:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/group-wise-overall', async (req, res) => {
  try {
    const { selectedMonth, selectedSalesManager, selectedTeamManager, selectedTeamLeader } = req.query;
    const counselorData = await HirrachicalData(selectedMonth, selectedSalesManager, selectedTeamManager, selectedTeamLeader);
    const GropWise = await calculateGroupTotals(counselorData);
    console.log(GropWise.length)
    res.json(GropWise);
  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/count-data', async (req, res) => {
  try {
    const counselorData = await HirrachicalData();
    const metrics = {
      SalesManagers: {},
      TeamManagers: {},
      TeamLeaders: {},
    };
    counselorData.forEach((counselor) => {
      const {
        Counselor,
        TeamLeaders,
        TeamManager,
        SalesManager,
        Target,
        TotalLead,
        Admissions,
        CollectedRevenue,
        BilledRevenue,
      } = counselor;
      if (SalesManager) {
        if (!metrics.SalesManagers[SalesManager]) {
          metrics.SalesManagers[SalesManager] = {
            Target: 0,
            TotalLead: 0,
            Admissions: 0,
            CollectedRevenue: 0,
            BilledRevenue: 0,
          };
        }
        metrics.SalesManagers[SalesManager].Target += Target;
        metrics.SalesManagers[SalesManager].TotalLead += TotalLead;
        metrics.SalesManagers[SalesManager].Admissions += Admissions;
        metrics.SalesManagers[SalesManager].CollectedRevenue += CollectedRevenue;
        metrics.SalesManagers[SalesManager].BilledRevenue += BilledRevenue;
      }
      if (TeamManager) {
        if (!metrics.TeamManagers[TeamManager]) {
          metrics.TeamManagers[TeamManager] = {
            Target: 0,
            TotalLead: 0,
            Admissions: 0,
            CollectedRevenue: 0,
            BilledRevenue: 0,
          };
        }
        metrics.TeamManagers[TeamManager].Target += Target;
        metrics.TeamManagers[TeamManager].TotalLead += TotalLead;
        metrics.TeamManagers[TeamManager].Admissions += Admissions;
        metrics.TeamManagers[TeamManager].CollectedRevenue += CollectedRevenue;
        metrics.TeamManagers[TeamManager].BilledRevenue += BilledRevenue;
      }
      if (TeamLeaders) {
        if (!metrics.TeamLeaders[TeamLeaders]) {
          metrics.TeamLeaders[TeamLeaders] = {
            Target: 0,
            TotalLead: 0,
            Admissions: 0,
            CollectedRevenue: 0,
            BilledRevenue: 0,
          };
        }
        metrics.TeamLeaders[TeamLeaders].Target += Target;
        metrics.TeamLeaders[TeamLeaders].TotalLead += TotalLead;
        metrics.TeamLeaders[TeamLeaders].Admissions += Admissions;
        metrics.TeamLeaders[TeamLeaders].CollectedRevenue += CollectedRevenue;
        metrics.TeamLeaders[TeamLeaders].BilledRevenue += BilledRevenue;
      }
    });

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching counselor metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;

