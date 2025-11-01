// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const path = require("path");

// const app = express();
// app.use(cors());
// app.use(express.static("public"));

// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: { origin: "*", methods: ["GET", "POST"] },
// });

// io.on("connection", (socket) => {
//     console.log("🟢 New client connected:", socket.id);

//     socket.on("offer", (data) => {
//         console.log("📡 Offer received from camera");
//         socket.broadcast.emit("offer", data);
//     });

//     socket.on("answer", (data) => {
//         console.log("📨 Answer received from viewer");
//         socket.broadcast.emit("answer", data);
//     });

//     socket.on("candidate", (data) => {
//         socket.broadcast.emit("candidate", data);
//     });

//     socket.on("disconnect", () => {
//         console.log("🔴 Client disconnected:", socket.id);
//     });
// });

// app.get("/", (_, res) => res.send("🚖 WebRTC Signaling Server Running ✅"));

// const PORT = process.env.PORT || 8000;
// server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    // Front camera
    socket.on("offer_front", (data) => {
        console.log("📡 Front camera offer");
        socket.broadcast.emit("offer_front", data);
    });
    socket.on("answer_front", (data) => socket.broadcast.emit("answer_front", data));
    socket.on("candidate_front", (data) => socket.broadcast.emit("candidate_front", data));

    // Back camera
    socket.on("offer_back", (data) => {
        console.log("📡 Back camera offer");
        socket.broadcast.emit("offer_back", data);
    });
    socket.on("answer_back", (data) => socket.broadcast.emit("answer_back", data));
    socket.on("candidate_back", (data) => socket.broadcast.emit("candidate_back", data));

    socket.on("disconnect", () => console.log("🔴 Client disconnected:", socket.id));
});

app.get("/", (_, res) => res.send("🚖 WebRTC Dual-Camera Signaling Server ✅"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
