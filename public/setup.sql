-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS inventory_management;

-- استخدام قاعدة البيانات
USE inventory_management;

-- جدول المخزون (Inventory)
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quantity_in INT DEFAULT 0,
    quantity_out INT DEFAULT 0
);

-- جدول الطلبات (Requests)
CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_date DATE NOT NULL,
    requester_name VARCHAR(100) NOT NULL,
    item_id INT NOT NULL,
    quantity_requested INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES inventory(id)
);

-- إدخال بيانات تجريبية
INSERT INTO inventory (name, quantity_in, quantity_out)
VALUES 
    ('Mouse', 100, 0),
    ('Keyboard', 50, 0),
    ('Monitor', 20, 0);

INSERT INTO requests (request_date, requester_name, item_id, quantity_requested)
VALUES
    ('2024-11-01', 'John Doe', 1, 5),
    ('2024-11-02', 'Jane Smith', 2, 10);
