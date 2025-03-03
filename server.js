const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
const prisma = new PrismaClient();

app.get('/', (req, res) => {
    res.send('Hello world');
});

// ดึงข้อมูลผู้ใช้ทั้งหมด (READ)
app.get('/user', async (req, res) => {
    try {
        const data = await prisma.user.findMany();
        const finalData = data.map(record => {
            delete record.password; // ซ่อนรหัสผ่าน
            return record;
        });
        res.json({ message: 'OK', data: finalData });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// เพิ่มข้อมูลผู้ใช้ใหม่ (CREATE)
app.post('/user', async (req, res) => {
    try {
        const { username, password } = req.body;
        const response = await prisma.user.create({
            data: { username, password }
        });
        res.json({ message: 'User added successfully', data: response });
    } catch (error) {
        res.status(500).json({ error: "Error adding user" });
    }
});

// แก้ไขข้อมูลผู้ใช้ (UPDATE)
app.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { username, password }
        });
        res.json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Error updating user" });
    }
});

// ลบผู้ใช้ (DELETE)
app.delete('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);

        // ตรวจสอบว่า ID เป็นตัวเลข
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // ตรวจสอบว่าผู้ใช้มีอยู่จริง
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            return res.status(404).json({ error: "User not found" });
        }

        // ลบผู้ใช้
        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ message: `User with ID ${userId} deleted successfully` });


    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Error deleting user" });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});