const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const DsrRoutes = require('./routes/DsrRoutes');
const DsrDeleteDataRoutes = require('./routes/DataDelete');
const sequelize = require('./config');
const CounselorWiseSummery = require('./models/CounselorData');
const CounselorWiseSummary = require('./models/CounselorWiseSummary')
const CounselorWiseTeam = require('./models/CounselorWiseTeam');
const { col, fn, DataTypes, literal, Op } = require('sequelize');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

(async () => {
    try {
        await sequelize.sync();
        console.log('Table created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
    }
})();

app.use('/dsr_report', DsrRoutes);
app.use('/data_Delete', DsrDeleteDataRoutes);

app.get('/', (req, res) => {
    res.json('Hello, how are you...');
});



app.post('/team/upload', upload.single('excelFile'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const worksheet = workbook.getWorksheet(1);
        if (worksheet) {
            const dataToSave = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    const rowData = {
                        ExecutiveName: row.getCell(1).value || null,
                        TeamLeaders: row.getCell(2).value || null,
                        TeamManager: row.getCell(3).value || null,
                        AsstManagers: row.getCell(4).value || null,
                        Team: row.getCell(5).value || null,
                        HC: row.getCell(6).value || null,
                        Group: row.getCell(7).value || null,
                        Month: row.getCell(8).value || null,
                    };
                    dataToSave.push(rowData);
                }
            });

            await CounselorWiseTeam.bulkCreate(dataToSave)
                .then(() => {
                    console.log('Team saved to the database.');
                })
                .catch(err => {
                    console.error('Error saving Team to the database:', err);
                });
            res.json({ message: 'Excel Team uploaded and team saved to the database in 30 seconds' });
        } else {
            res.status(400).json({ error: 'No valid worksheet found in the Excel file To add Team.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// app.post('/summary/upload', upload.single('excelFile'), async (req, res) => {
//     try {
//         const fileBuffer = req.file.buffer;
//         const workbook = new ExcelJS.Workbook();
//         await workbook.xlsx.load(fileBuffer);

//         const worksheet = workbook.getWorksheet(1);
//         if (worksheet) {
//             const dataToSave = [];
//             worksheet.eachRow((row, rowNumber) => {
//                 if (rowNumber !== 1) {
//                     const rowData = {
//                         Month: row.getCell(1).value || null,
//                         LeadID: row.getCell(2).value || null,
//                         LeadCreationDate: row.getCell(3).value || null,
//                         ExecutiveName: row.getCell(4).value || null,
//                         Team: row.getCell(5).value || null,
//                         StudentName: row.getCell(6).value || null,
//                         CourseShortName: row.getCell(7).value || null,
//                         Specialization: row.getCell(8).value || null,
//                         AmountReceived: row.getCell(9).value || null,
//                         DiscountAmount: row.getCell(10).value || null,
//                         DiscountReason: row.getCell(11).value || null,
//                         StudyMaterial: row.getCell(12).value || null,
//                         StudyMaterialDiscount: row.getCell(13).value || null,
//                         AmountBilled: row.getCell(14).value || null,
//                         PaymentMode: row.getCell(15).value || null,
//                         Accountdetails: row.getCell(16).value || null,
//                         PaymentOption: row.getCell(17).value || null,
//                         SaleDate: row.getCell(18).value || null,
//                         ContactNumber: row.getCell(19).value || null,
//                         EmailID: row.getCell(20).value || null,
//                         Sourcetype: row.getCell(21).value || null,
//                         Team2: row.getCell(22).value || null,
//                         PrimarySource: row.getCell(23).value || null,
//                         SecondarySource: row.getCell(24).value || null,
//                         LeadID2: row.getCell(25).value || null,
//                         Source: row.getCell(26).value || null,
//                         AgencySource: row.getCell(27).value || null,
//                         '1st payment amt': row.getCell(28).value || null,
//                         EnrollmentId: row.getCell(29).value || null,
//                         Cohort: row.getCell(30).value || null,
//                         SecondarySource2: row.getCell(31).value || null,
//                     };
//                     dataToSave.push(rowData);
//                 }
//             });


//             // Use findOrCreate to handle both finding and creating records
//             const promises = dataToSave.map(async (rowData) => {
//                 try {
//                     await CounselorWiseSummary.findOrCreate({
//                         where: { LeadID: rowData.LeadID },
//                         defaults: rowData,
//                     });
//                 } catch (error) {
//                     console.error('Error saving data to the database:', error);
//                 }
//             });

//             await Promise.all(promises);

//             res.json({ message: 'Excel file uploaded and data saved to the database.' });
//         } else {
//             res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
//         }
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });



app.post('/summary/upload', upload.single('excelFile'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const worksheet = workbook.getWorksheet(1);
        if (worksheet) {
            const dataToSave = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    const rowData = {
                        Month: row.getCell(1).value || null,
                        LeadID: row.getCell(2).value || null,
                        LeadCreationDate: row.getCell(3).value || null,
                        ExecutiveName: row.getCell(4).value || null,
                        Team: row.getCell(5).value || null,
                        StudentName: row.getCell(6).value || null,
                        CourseShortName: row.getCell(7).value || null,
                        Specialization: row.getCell(8).value || null,
                        AmountReceived: row.getCell(9).value || null,
                        DiscountAmount: row.getCell(10).value || null,
                        DiscountReason: row.getCell(11).value || null,
                        StudyMaterial: row.getCell(12).value || null,
                        StudyMaterialDiscount: row.getCell(13).value || null,
                        AmountBilled: row.getCell(14).value || null,
                        PaymentMode: row.getCell(15).value || null,
                        Accountdetails: row.getCell(16).value || null,
                        PaymentOption: row.getCell(17).value || null,
                        SaleDate: row.getCell(18).value || null,
                        ContactNumber: row.getCell(19).value || null,
                        EmailID: row.getCell(20).value || null,
                        Sourcetype: row.getCell(21).value || null,
                        Team2: row.getCell(22).value || null,
                        PrimarySource: row.getCell(23).value || null,
                        SecondarySource: row.getCell(24).value || null,
                        LeadID2: row.getCell(25).value || null,
                        Source: row.getCell(26).value || null,
                        AgencySource: row.getCell(27).value || null,
                        '1st payment amt': row.getCell(28).value || null,
                        EnrollmentId: row.getCell(29).value || null,
                        Cohort: row.getCell(30).value || null,
                        SecondarySource2: row.getCell(31).value || null,
                    };
                    dataToSave.push(rowData);
                }
            });

            // Use Promise.all to wait for all the operations to complete
            await Promise.all(dataToSave.map(async (rowData) => {
                try {
                    let counselorSummary = await CounselorWiseSummary.findOne({ where: { LeadID: rowData.LeadID } });
                    if (!counselorSummary) {
                        await CounselorWiseSummary.create(rowData);
                    } else {
                        // Update certain fields if the record already exists
                        await counselorSummary.update({
                            AmountReceived: rowData.AmountReceived,
                            Accountdetails: rowData.Accountdetails,
                            Sourcetype: rowData.Sourcetype,
                            PrimarySource: rowData.PrimarySource,
                            SecondarySource: rowData.SecondarySource,
                            Source: rowData.Source,
                            AgencySource: rowData.AgencySource,
                            SecondarySource2: rowData.SecondarySource2
                        });
                    }
                } catch (error) {
                    console.error('Error saving or updating data:', error);
                }
            }));

            res.json({ message: 'Excel file uploaded and data saved to the database.' });
        } else {
            res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/update-lead-to-sale-duration', async (req, res) => {
    try {
        // Retrieve the month from query parameters
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ message: 'Month query parameter is required' });
        }

        // Retrieve all records for the specified month
        const records = await CounselorWiseSummary.findAll({
            where: { Month: month }
        });

        if (records.length === 0) {
            return res.status(404).json({ message: `No records found for month: ${month}` });
        }

        // Update LeadToSaleDuration for each record
        for (const record of records) {
            const leadCreationDate = record.LeadCreationDate;
            const saleDate = record.SaleDate;

            if (leadCreationDate && saleDate) {
                const leadToSaleDuration = Math.floor((new Date(saleDate) - new Date(leadCreationDate)) / (1000 * 60 * 60 * 24));
                console.log(leadToSaleDuration, 'days')
                // Update the record with the calculated LeadToSaleDuration
                await record.update({ LeadToSaleDuration: leadToSaleDuration });
            }
        }

        res.json({ message: `LeadToSaleDuration updated successfully for month: ${month}` });
    } catch (error) {
        console.error('Error updating LeadToSaleDuration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





// app.post('/conselor-target-totalLead/upload', upload.single('excelFile'), async (req, res) => {
//     try {
//         const fileBuffer = req.file.buffer;
//         const workbook = new ExcelJS.Workbook();
//         await workbook.xlsx.load(fileBuffer);

//         const worksheet = workbook.getWorksheet(1);

//         if (worksheet) {
//             const dataToSave = [];
//             worksheet.eachRow((row, rowNumber) => {
//                 if (rowNumber !== 1) { // Skip the header row
//                     const rowData = {
//                         Counselor: row.getCell(1).value,
//                         Month: row.getCell(2).value,
//                         TeamLeaders: row.getCell(3).value,
//                         TeamManager: row.getCell(4).value,
//                         SalesManager: row.getCell(5).value,
//                         Role: row.getCell(6).value,
//                         Team: row.getCell(7).value,
//                         Status: row.getCell(8).value,
//                         Target: row.getCell(9).value,
//                         TotalLead: row.getCell(10).value,
//                         ConnectedCall: row.getCell(11).value,
//                         TalkTime: String(row.getCell(12).value),
//                         Final: row.getCell(13).value,
//                         Group: row.getCell(14).value,
//                     };

//                     dataToSave.push(rowData);
//                 }
//             });

//             // Use Promise.all to wait for all the bulkCreates to complete
//             await Promise.all(dataToSave.map(async (rowData) => {
//                 // Find or create a record with the specified counselor name and month
//                 const [counselor, created] = await CounselorWiseSummery.findOrCreate({
//                     where: { Counselor: rowData.Counselor, Month: rowData.Month },
//                     defaults: rowData,
//                 });

//                 if (!created) {
//                     // Update the values if the record already exists
//                     await counselor.update(rowData);
//                 }
//             }));

//             console.log('Data saved to the database.');
//             res.json({ message: 'Excel file uploaded and data saved to the database.' });
//         } else {
//             res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
//         }
//     } catch (err) {
//         console.error('Error saving data to the database:', err);
//         res.status(500).json({ error: err.message });
//     }
// });


app.post('/conselor-target-totalLead/upload', upload.single('excelFile'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const worksheet = workbook.getWorksheet(1);

        if (worksheet) {
            const dataToSave = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) { // Skip the header row
                    const rowData = {
                        Counselor: row.getCell(1).value,
                        Month: row.getCell(2).value,
                        TeamLeaders: row.getCell(3).value,
                        TeamManager: row.getCell(4).value,
                        SalesManager: row.getCell(5).value,
                        Role: row.getCell(6).value,
                        Team: row.getCell(7).value,
                        Status: row.getCell(8).value,
                        Target: row.getCell(9).value,
                        TotalLead: row.getCell(10).value,
                        ConnectedCall: row.getCell(11).value,
                        TalkTime: String(row.getCell(12).value),
                        Final: row.getCell(13).value,
                        Group: row.getCell(14).value,
                    };

                    dataToSave.push(rowData);
                }
            });

            // Use Promise.all to wait for all the bulkCreates to complete
            await Promise.all(dataToSave.map(async (rowData) => {
                if (rowData.Counselor && rowData.Month) {
                    // Find or create a record with the specified counselor name and month
                    const [counselor, created] = await CounselorWiseSummery.findOrCreate({
                        where: { Counselor: rowData.Counselor, Month: rowData.Month },
                        defaults: rowData,
                    });

                    if (!created) {
                        // Update the values if the record already exists
                        await counselor.update({
                            Target: rowData.Target,
                            TotalLead: rowData.TotalLead,
                            ConnectedCall: rowData.ConnectedCall,
                            TalkTime: String(rowData.TalkTime),
                            // Group:rowData.Group
                        });
                    }
                }
            }));

            console.log('Data saved to the database.');
            res.json({ message: 'Excel file uploaded and data saved to the database.' });
        } else {
            res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
        }
    } catch (err) {
        console.error('Error saving data to the database:', err);
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/leadToSaleDurationCount', async (req, res) => {
    try {
        const result = await CounselorWiseSummary.findAll({
            attributes: [
                'Month',
                [fn('COUNT', col('LeadToSaleDuration')), 'LeadToSaleDurationCount'],
            ],
            where: {
                LeadToSaleDuration: 0,
            },
            group: ['Month'],
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching leadToSaleDurationCount:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/api/leadToSaleDurationZero/:month', async (req, res) => {
    try {
        const month = req.params.month
        const result = await CounselorWiseSummary.findAll({
            attributes: [
                [literal('COUNT(CASE WHEN LeadToSaleDuration = 0 THEN 1 END)'), 'LeadToSaleDurationCount'],
                [literal('MIN(LeadCreationDate)'), 'LeadCreationDate'],
            ],
            where: {
                month: month,
                LeadToSaleDuration: 0,
            },
            group: ['LeadCreationDate'],
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching leadToSaleDurationZero:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/api/allmonthssourceCounts', async (req, res) => {
    try {
        const result = await CounselorWiseSummary.findAll({
            attributes: [
                'AgencySource',
                [sequelize.fn('COUNT', sequelize.col('AgencySource')), 'sourceCount'],
            ],
            group: ['AgencySource'],
            where: {
                AgencySource: {
                    [Op.ne]: null,
                },
            },
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching source counts by month:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/sourceCountsByMonth', async (req, res) => {
    try {
        const { month } = req.query;

        const whereCondition = month
            ? {
                Month: {
                    [Op.eq]: month,
                    [Op.ne]: null, // Exclude null values
                },
                AgencySource: {
                    [Op.ne]: null, // Exclude null values for AgencySource
                },

            }
            : {
                Month: {
                    [Op.ne]: null, // Exclude null values
                },
                AgencySource: {
                    [Op.ne]: null, // Exclude null values for AgencySource
                },

            };

        const result = await CounselorWiseSummary.findAll({
            attributes: [
                'Month',
                'AgencySource',
                [sequelize.fn('COUNT', sequelize.col('AgencySource')), 'sourceCount'],
            ],
            where: whereCondition,
            group: ['Month', 'AgencySource'],
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching source counts by month:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/api/saveFormData', async (req, res) => {
    try {
        const newData = req.body;
        console.log(newData, 49)
        const savedData = await CounselorWiseSummary.create(newData);
        res.status(201).json(savedData);
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/monthlyCourseCounts', async (req, res) => {
    try {
        const monthlyCounts = await CounselorWiseSummary.findAll({
            attributes: [
                [
                    sequelize.fn(
                        'CONCAT',
                        sequelize.fn('LEFT', sequelize.col('Month'), 3),
                        sequelize.fn('RIGHT', sequelize.col('Month'), 2)
                    ),
                    'Month',
                ],
                'CourseShortName',
                [sequelize.fn('COUNT', sequelize.col('CourseShortName')), 'CourseCount'],
            ],
            group: ['Month', 'CourseShortName'],
            raw: true,
        });

        res.json(monthlyCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/monthCourseCounts', async (req, res) => {
    try {
        // Extract the month parameter from the query string
        const { month } = req.query;

        // Define a condition to filter by month
        const monthCondition = month ? { Month: month } : {};

        const monthlyCounts = await CounselorWiseSummary.findAll({
            attributes: [
                [
                    sequelize.fn(
                        'CONCAT',
                        sequelize.fn('LEFT', sequelize.col('Month'), 3),
                        sequelize.fn('RIGHT', sequelize.col('Month'), 2)
                    ),
                    'Month',
                ],
                'CourseShortName',
                [sequelize.fn('COUNT', sequelize.col('CourseShortName')), 'CourseCount'],
            ],
            where: monthCondition, // Apply the condition for filtering by month
            group: ['Month', 'CourseShortName'],
            raw: true,
        });

        res.json(monthlyCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// app.post('/conselor-target-totalLead/upload', upload.single('excelFile'), async (req, res) => {
//     try {
//         const fileBuffer = req.file.buffer;
//         const workbook = new ExcelJS.Workbook();
//         await workbook.xlsx.load(fileBuffer);

//         const worksheet = workbook.getWorksheet(1);

//         if (worksheet) {
//             const dataToSave = [];
//             worksheet.eachRow((row, rowNumber) => {
//                 if (rowNumber !== 1) { // Skip the header row
//                     const rowData = {
//                         Counselor: row.getCell(1).value,
//                         Month:row.getCell(2).value,
//                         TeamLeaders: row.getCell(3).value,
//                         TeamManager: row.getCell(4).value,
//                         SalesManager: row.getCell(5).value,
//                         Role: row.getCell(6).value,
//                         Team: row.getCell(7).value,
//                         Status: row.getCell(8).value,
//                         Target: row.getCell(9).value,
//                         TotalLead: row.getCell(10).value,
//                         ConnectedCall: row.getCell(11).value,
//                         TalkTime: row.getCell(12).value,
//                         Final: row.getCell(13).value,
//                         Group: row.getCell(14).value,
//                     };

//                     dataToSave.push(rowData);
//                 }
//             });

//             await CounselorWiseSummery.bulkCreate(dataToSave)
//                 .then(() => {
//                     console.log('Data saved to the database.');
//                 })
//                 .catch(err => {
//                     console.error('Error saving data to the database:', err);
//                 });
//             res.json({ message: 'Excel file uploaded and data saved to the database.' });
//         } else {
//             res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
//         }
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// const CounselorWiseSummery = require('./models/CounselorData');
// const CounselorWiseSummary = require('./models/CounselorWiseSummary')


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
