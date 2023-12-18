const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const DsrRoutes = require('./routes/DsrRoutes');
const DsrDeleteDataRoutes = require('./routes/DataDelete');
const sequelize = require('./config');
const CounselorWiseSummery = require('./models/CounselorData');
const CounselorWiseSummary = require('./models/CounselorWiseSummary')
const CounselorWiseTeam = require('./models/CounselorWiseTeam')
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


            // Use findOrCreate to handle both finding and creating records
            const promises = dataToSave.map(async (rowData) => {
                try {
                    await CounselorWiseSummary.findOrCreate({
                        where: { LeadID: rowData.LeadID },
                        defaults: rowData,
                    });
                } catch (error) {
                    console.error('Error saving data to the database:', error);
                }
            });

            await Promise.all(promises);

            res.json({ message: 'Excel file uploaded and data saved to the database.' });
        } else {
            res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
                // Find or create a record with the specified counselor name and month
                const [counselor, created] = await CounselorWiseSummery.findOrCreate({
                    where: { Counselor: rowData.Counselor, Month: rowData.Month },
                    defaults: rowData,
                });

                if (!created) {
                    // Update the values if the record already exists
                    await counselor.update(rowData);
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

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
