// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
// const bodyParser = require("body-parser");
// const http = require("http");
// const { Server } = require("socket.io");
// const path = require("path");
// const { connectDB } = require("./config/db");
// const compression = require("compression");

// const media = require("./routes/media");
// const { APP_URL, APP_URL_1, PORT = 8000 } = process.env;

// connectDB();
// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: [APP_URL, APP_URL_1, "*"],
//         methods: ["GET", "POST"],
//     },
//     transports: ["websocket"],
//     // maxHttpBufferSize: 5e6, // 5 MB (default is 1 MB)
//     // pingInterval: 20000,
//     // pingTimeout: 30000,
//     pingInterval: 25000,  // 25s between pings
//     pingTimeout: 60000,   // wait up to 60s for pong before disconnect
//     maxHttpBufferSize: 1e8 // allow larger frames (100 MB)
// });


// app.use(
//     cors({
//         origin: [APP_URL, APP_URL_1, "*"],
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );
// app.use(morgan("dev"));
// app.use(compression());
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(express.static("public"));

// app.get("/", (_, res) => {
//     res.send("🚖 TaxiVision backend running ✅");
// });
// app.use("/media", media);
// app.use(express.static(path.join(__dirname, "public")));

// io.on("connection", (socket) => {
//     console.log("📡 New socket connected:", socket.id);

//     socket.on("ping-server", (msg) => {
//         console.log("📨 Ping:", msg);
//         socket.emit("pong-client", "Pong from server ✅");
//     });

//     socket.on("video-frame", (frameData) => {
//         if (frameData) io.emit("video-feed", frameData);
//     });

//     socket.on("disconnect", (reason) => {
//         console.log("❌ Socket disconnected:", reason);
//     });
// });

// server.keepAliveTimeout = 0;
// server.headersTimeout = 0;

// server.listen(PORT, () => {
//     console.log(`✅ Server running on PORT ${PORT}`);
// });


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const compression = require("compression");
const { connectDB } = require("./config/db");

const media = require("./routes/media");
const { APP_URL, APP_URL_1, PORT = 8000 } = process.env;

// ✅ DB connect
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: [APP_URL, APP_URL_1, "*"],
        methods: ["GET", "POST"],
    },
    transports: ["websocket"],
    pingInterval: 25000,
    pingTimeout: 60000,
    maxHttpBufferSize: 1e8,
});

app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static("public"));

app.get("/", (_, res) => res.send("🚖 TaxiVision backend running ✅"));
app.use("/media", media);
app.use(express.static(path.join(__dirname, "public")));

// ✅ Track roles
let cameraSocket = null; // mobile camera device
let viewerSocket = null; // dashboard viewer

io.on("connection", (socket) => {
    console.log("📡 New socket connected:", socket.id);

    // Identify device type
    socket.on("register-device", (type) => {
        if (type === "camera") {
            cameraSocket = socket;
            console.log("🎥 Camera device registered:", socket.id);
        } else if (type === "viewer") {
            viewerSocket = socket;
            console.log("🖥️ Viewer connected:", socket.id);
        }
    });

    // Ping-pong handshake
    socket.on("ping-server", (msg) => {
        console.log("📨 Ping:", msg);
        socket.emit("pong-client", "Pong from server ✅");
    });

    // Receive frame from camera → send to viewer
    socket.on("video-frame", (frameData) => {
        if (frameData && viewerSocket) {
            viewerSocket.emit("video-feed", frameData);
        }
    });

    // Receive "switch-camera" command from viewer → forward to camera
    socket.on("switch-camera", (direction) => {
        console.log("🪄 Switch camera command:", direction);
        if (cameraSocket) {
            cameraSocket.emit("camera-switch-command", direction);
        }
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected:", reason);
        if (socket === cameraSocket) cameraSocket = null;
        if (socket === viewerSocket) viewerSocket = null;
    });
});

server.keepAliveTimeout = 0;
server.headersTimeout = 0;

server.listen(PORT, () => {
    console.log(`✅ Server running on PORT ${PORT}`);
});
