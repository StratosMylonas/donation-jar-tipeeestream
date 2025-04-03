require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const donationGoal = parseFloat(process.env.TOTAL_GOAL) || 1000;
let totalDonations = parseFloat(process.env.INITIAL_GOAL) || 0; // Start from .env value

app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Connect to TipeeeStream WebSocket
async function connectTipeeeStream() {
    try {
        const { data } = await axios.get('https://api.tipeeestream.com/v2.0/site/socket');
        const socketData = data.datas;
        if (!socketData) return;

        const tipeeeSocket = require('socket.io-client')(`${socketData.host}:${socketData.port}`, {
            query: { access_token: process.env.TIPEEESTREAM_API_KEY }
        });

        tipeeeSocket.on('connect', () => {
            console.log('✅ Connected to TipeeeStream WebSocket');
            tipeeeSocket.emit('join-room', {
                room: process.env.TIPEEESTREAM_API_KEY,
                username: 'OBS-Listener'
            });
        });

        tipeeeSocket.on('new-event', (data) => {
            if (data.event.type === 'donation') {
                const amount = parseFloat(data.event.parameters.amount);
                if (!isNaN(amount)) {
                    totalDonations += amount;
                    console.log(`💰 New Donation: €${amount} | Total: €${totalDonations}`);
                    io.emit('donation-update', { totalDonations, goal: donationGoal });
                }
            }
        });

        tipeeeSocket.on('disconnect', () => console.log('❌ Disconnected from TipeeeStream'));

    } catch (error) {
        console.error('❌ Error connecting to TipeeeStream:', error);
    }
}

// Start TipeeeStream connection
connectTipeeeStream();

// Send initial donation data when a client connects
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.emit('donation-goal', {
        title: process.env.GOAL_TITLE || "Donation Goal",
        currentDonations: totalDonations,
        goal: donationGoal
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
