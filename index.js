
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const dotenv = require('dotenv')
const app = express();
const env = dotenv.config().parsed

app.use(bodyParser.json());

// กำหนด connection string สำหรับเชื่อมต่อ database
const config = {
    user: env.USER,
    password: env.PASSWORD,
    server: env.SERVER, 
    synchronize: true,
    database: env.DATABASE,
    trustServerCertificate: true,
    encrypt: true,
} 

const pool = new sql.ConnectionPool(config);
const result = new sql.Request(pool)

app.get('/', (_req, res) => {
    res.send('Welcome to the API CPE451')
})

// กำหนด route สำหรับดึงข้อมูล user ทั้งหมด
app.get('/users', async (req, res) => {
    pool.connect(function (err) {
        try {

            result.query('SELECT * FROM [User]', function (error, results) {
                res.send(results.recordset);
                console.log(results.recordset)
            })

        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })
});

// กำหนด route สำหรับเพิ่มข้อมูล user ใหม่
app.post('/users', async (req, res) => {
    pool.connect(function (err) {
        try {
            const result = new sql.Request(pool);
            result.input('ID', sql.Char(36), req.body.ID)
                .input('firstName', sql.VarChar(50), req.body.firstName)
                .input('lastName', sql.VarChar(50), req.body.lastName)
                .input('eMail', sql.VarChar(100), req.body.eMail)
                .input('password', sql.VarChar(100), req.body.password)
                .input('typeOfUser', sql.VarChar(50), req.body.typeOfUser)
                .query('INSERT INTO [User] (ID, firstName, lastName, eMail, [password], typeOfUser) VALUES (@ID, @firstName, @lastName, @eMail, @password, @typeOfUser)', (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    } else {
                        console.log("Data inserted successfully");
                        res.status(200).send("Data inserted successfully");
                    }
                    // ปิดการเชื่อมต่อกับฐานข้อมูล
                    pool.close();
                });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })
});

// กำหนด route สำหรับดึงข้อมูล type ทั้งหมด
app.get('/types', async (req, res) => {
    pool.connect(function (err) {
        try {

            result.query('SELECT * FROM [Type]', function (error, results) {
                res.send(results.recordset);
            })

        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })
});


// กำหนด route สำหรับเพิ่มข้อมูล type ใหม่
app.post('/types', async (req, res) => {
    pool.connect(function (err) {
        try {
            const result = new sql.Request(pool);
            result.input('type', sql.VarChar(50), req.body.type)
                .query('INSERT INTO [Type] ([type]) VALUES (@type)', (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    } else {
                        console.log("Data inserted successfully");
                        res.status(200).send("Data inserted successfully");
                    }
                    // ปิดการเชื่อมต่อกับฐานข้อมูล
                    pool.close();
                });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })
});

// กำหนด route สำหรับดึงข้อมูล submit ทั้งหมด
app.get('/submits', async (req, res) => {
    pool.connect(function (err) {
        try {

            result.query('SELECT * FROM [Submit]', function (error, results) {
                res.send(results.recordset);
            })

        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })
});

// กำหนด route สำหรับเพิ่มข้อมูล submit ใหม่
app.post('/submits', async (req, res) => {
    pool.connect(function (err) {

        try {
            const result = new sql.Request(pool);
            result.input('caseId', sql.Char(36), req.body.caseId)
                .input('details', sql.Text, req.body.detail)
                .input('status', sql.Bit, req.body.status)
                .query('INSERT INTO [Submit] (caseId, details, [status]) VALUES (@caseId, @details, @status)', (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    } else {
                        console.log("Data inserted successfully");
                        res.status(200).send("Data inserted successfully");
                    }
                    // ปิดการเชื่อมต่อกับฐานข้อมูล
                    pool.close();
                });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })
});

app.put('/submits/:submitId', async (req, res) => {
    const submitId = req.params.submitId;
    const newStatus = req.body.status;
    pool.connect(function (err) {
        try {
            const result = new sql.Request(pool);
            result.input('status', sql.Bit, newStatus);
            result.input('submitId', sql.Char(36), submitId);
            result.query('UPDATE [Submit] SET [status] = @status WHERE caseId = @submitId', (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    console.log("Data updated successfully");
                    res.status(200).send("Data updated successfully");
                }
                pool.close();
            });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    });
});

// // กำหนด route สำหรับดึงข้อมูล case ทั้งหมด

app.get('/cases', async (req, res) => {
    pool.connect(function (err) {
        try {

            result.query('SELECT * FROM [Case]', function (error, results) {
                res.send(results.recordset);
            })

        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    })
});

// กำหนด route สำหรับเพิ่มข้อมูล case ใหม่
app.post('/cases', async (req, res) => {

    // แปลง string เป็น Date object
    const dateString = req.body.date;
    const [datePart, timePart] = dateString.split(' ');

    const [day, month, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    const jsDate = new Date(year, month - 1, day, hour, minute, second);
    const dateString1 = jsDate.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });

    pool.connect(function (err) {
        try {
            const result = new sql.Request(pool);
            result
                .input('caseId', sql.Char(36), req.body.caseId)
                .input('details', sql.VarChar(sql.MAX), req.body.detail)
                .input('latitude', sql.Float, req.body.latitude)
                .input('type', sql.VarChar(50), req.body.category)
                .input('longitude', sql.Float, req.body.longitude)
                .input('location', sql.Text, req.body.location)
                .input('phoneNumber', sql.NVarChar(20), req.body.phone)
                .input('image', sql.Text, req.body.image)
                .input('userId', sql.NVarChar(36), req.body.userId)
                .input('date', sql.DateTime, dateString1)
                .input('title', sql.NVarChar(255), req.body.title)
                .query(
                    'INSERT INTO [Case] (caseId, details, longitude, [type], latitude, location, phoneNumber, image, userId, date, title) VALUES (@caseId, @details, @longitude, @type, @latitude, @location, @phoneNumber, @image, @userId, @date, @title)',
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send(err);
                        } else {
                            console.log('Data inserted successfully');
                            res.status(200).send('Data inserted successfully');
                        }
                        // ปิดการเชื่อมต่อกับฐานข้อมูล
                        pool.close();
                    }
                );
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    });
});
// รัน server ที่ port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});