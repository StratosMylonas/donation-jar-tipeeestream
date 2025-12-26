require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { path: "/socket.io" });

const PORT = process.env.PORT || 3000;

// ----------------------
// Files for persistence
// ----------------------
const DATA_FILE = path.join(__dirname, "data.json");
const HISTORY_FILE = path.join(__dirname, "history.json");

// Load data.json or create default
let data = {
    totalDonations: 0,
    donationGoal: 1000,
    latestDonation: { name: "—", amount: 0 }
};

if (fs.existsSync(DATA_FILE)) {
    try {
        data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch (err) {
        console.error("Error reading data.json:", err);
    }
}

// Ensure history.json exists
if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, "[]", "utf8");
}

// ----------------------
// Serve overlays
// ----------------------
app.use("/jar", express.static(path.join(__dirname, "public/jar")));
app.get("/jar", (req, res) => res.sendFile(path.join(__dirname, "public/jar/index.html")));

app.use("/latest", express.static(path.join(__dirname, "public/latest")));
app.get("/latest", (req, res) => res.sendFile(path.join(__dirname, "public/latest/index.html")));

// Optional endpoint to get donation history
app.get("/history", (req, res) => {
    try {
        const history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to read history" });
    }
});

// ----------------------
// TipeeeStream WebSocket
// ----------------------
async function connectTipeeeStream() {
    try {
        const { data: socketInfo } = await axios.get(
            "https://api.tipeeestream.com/v2.0/site/socket"
        );
        if (!socketInfo.datas) return;

        const tipeeeSocket = require("socket.io-client")(
            `${socketInfo.datas.host}:${socketInfo.datas.port}`,
            { query: { access_token: process.env.TIPEEESTREAM_API_KEY } }
        );

        tipeeeSocket.on("connect", () => {
            console.log("✅ Connected to TipeeeStream WebSocket");
            tipeeeSocket.emit("join-room", {
                room: process.env.TIPEEESTREAM_API_KEY,
                username: "OBS-Listener"
            });
        });

        tipeeeSocket.on("new-event", (evt) => {
            if (evt.event.type === "donation") {
                const amount = parseFloat(evt.event.parameters.amount);
                const username = evt.event.parameters.username || "Anonymous";
                if (isNaN(amount)) return;

                // Update in-memory data
                data.totalDonations += amount;
                data.latestDonation = { name: username, amount };

                // Persist data.json
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");

                // Append to donation history
                try {
                    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
                    history.push({ name: username, amount, timestamp: new Date().toISOString() });
                    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf8");
                } catch (err) {
                    console.error("Error writing donation history:", err);
                }

                // Emit updates
                io.emit("donation-update", { totalDonations: data.totalDonations, goal: data.donationGoal });
                io.emit("latest-donation", data.latestDonation);

                console.log("New Donation:", username, "–", amount);
            }
        });

        tipeeeSocket.on("disconnect", () => console.log("❌ Disconnected from TipeeeStream"));
    } catch (err) {
        console.error("❌ TipeeeStream error:", err);
    }
}

connectTipeeeStream();

// ----------------------
// Frontend Socket.IO
// ----------------------
io.on("connection", (socket) => {
    console.log("🟢 Client connected");

    // Send donation goal
    socket.emit("donation-goal", {
        title: process.env.GOAL_TITLE || "Donation Goal",
        currentDonations: data.totalDonations,
        goal: data.donationGoal
    });

    // Send latest donation
    socket.emit("latest-donation", data.latestDonation);

    socket.on("disconnect", () => console.log("🔴 Client disconnected"));
});

server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/jar`));
