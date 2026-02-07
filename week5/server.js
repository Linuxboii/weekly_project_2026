import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
const server = createServer(app);
const { Pool } = pg;

// -- DB Pools (Same as backend.js) --
const mainPool = new Pool({
    host: "localhost",
    port: 5432,
    user: "avlokuser",
    password: "Myfirstbusiness@1477",
    database: "avlokai"
});

// -- Middleware --
app.use(cors());
app.use(express.json());

// -- Socket.io Setup --
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now, tighten later for production
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Example: Join a specific room based on project or global
    socket.join('nexus-global');

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // -- Real-time Node Events --
    socket.on('node:move', (data) => {
        // Broadcast to everyone else
        socket.to('nexus-global').emit('node:moved', data);
    });

    socket.on('node:add', (data) => {
        io.to('nexus-global').emit('node:added', data);
    });
});

// -- API Routes --
app.get('/health', (req, res) => {
    res.json({ status: 'Nexus Server OK' });
});

// Fetch all conversations for initial graph population
app.get('/api/graph/conversations', async (req, res) => {
    try {
        const result = await mainPool.query(`
      SELECT conversation_id, mobile_number, created_at, 'conversation' as type
      FROM conversations
      ORDER BY created_at DESC
      LIMIT 50
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    }
});

const PORT = 3005; // Different from backend.js (3567)
server.listen(PORT, () => {
    console.log(`Nexus Server running on port ${PORT}`);
});
