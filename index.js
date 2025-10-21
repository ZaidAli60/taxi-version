require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { connectDB } = require("./config/db");

// Import your routes
const media = require("./routes/media");

const { APP_URL, APP_URL_1, PORT = 8000 } = process.env;

// Connect to DB
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: [APP_URL, APP_URL_1, "*"],
        methods: ["GET", "POST"],
    },
});

// ✅ Middleware setup
app.use(
    cors({
        origin: [APP_URL, APP_URL_1, "*"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    })
);
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());
app.use(express.static("public"));


// ✅ Query cleanup middleware
const formatQueryValues = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === "null") obj[key] = null;
        else if (obj[key] === "undefined") obj[key] = null;
    });
    return obj;
};
app.use((req, res, next) => {
    req.query = formatQueryValues(req.query);
    next();
});

// ✅ Routes
app.get("/", (req, res) => {
    res.send("🚖 TaxiVision Backend is running successfully.");
});

app.use("/media", media);

// ✅ Test Socket.IO Route
app.get("/api/test-socket", (req, res) => {
    res.json({
        message: "Socket.IO test route working ✅",
        socket_url: `ws://localhost:${PORT}`,
    });
});

// ✅ Serve viewer dashboard (optional)
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("📡 New socket connected:", socket.id);

    socket.on("ping-server", (msg) => {
        console.log("📨 Ping received from client:", msg);
        socket.emit("pong-client", "Pong from server ✅");
    });

    socket.on("video-frame", (frameData) => {
        // Broadcast frame to all connected viewers
        socket.broadcast.emit("video-feed", frameData);
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
    });
});


// ✅ Start Server
server.listen(PORT, () => {
    console.log(`✅ Server running on PORT ${PORT}`);
});
