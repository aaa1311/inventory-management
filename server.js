const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// إعدادات الخادم
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// المسار الرئيسي لفتح صفحة البداية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // تحديث المسار هنا
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// اتصال MySQL
const db = mysql.createConnection({
    host: '127.0.0.1', // أو 'localhost'
    user: 'root',       // اسم المستخدم الخاص بـ MySQL
    password: '',       // كلمة المرور الخاصة بـ MySQL
    database: 'inventory_management', // اسم قاعدة البيانات
    port: 3306          // المنفذ الافتراضي
});

// تحقق من الاتصال
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// استرجاع بيانات المخزون
app.get('/inventory', (req, res) => {
    db.query('SELECT * FROM inventory', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// استرجاع بيانات الطلبات
app.get('/requests', (req, res) => {
    const query = `
        SELECT r.id, r.request_date, r.requester_name, i.name AS item_name, r.quantity_requested 
        FROM requests r 
        JOIN inventory i ON r.item_id = i.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// إضافة طلب جديد
app.post('/requests', (req, res) => {
    const { request_date, requester_name, item_id, quantity_requested } = req.body;

    const updateInventoryQuery = `
        UPDATE inventory 
        SET quantity_out = quantity_out + ? 
        WHERE id = ? AND (quantity_in - quantity_out) >= ?
    `;

    db.query(updateInventoryQuery, [quantity_requested, item_id, quantity_requested], (err, results) => {
        if (err || results.affectedRows === 0) {
            res.status(400).send({ error: 'Not enough quantity in inventory' });
        } else {
            const insertRequestQuery = `
                INSERT INTO requests (request_date, requester_name, item_id, quantity_requested) 
                VALUES (?, ?, ?, ?)
            `;
            db.query(insertRequestQuery, [request_date, requester_name, item_id, quantity_requested], (err) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send({ message: 'Request added successfully' });
                }
            });
        }
    });
});

// بدء الخادم
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
