require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const { connectDB } = require("./config/db")

// routes
const media = require("./routes/media")

const { APP_URL, APP_URL_1, PORT = 8000 } = process.env

connectDB();

const app = express()

app.use(cors({
    origin: [APP_URL, APP_URL_1],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}))

// app.use((req, res, next) => {
//     const apiKey = req.headers['x-api-key'];
//     if (apiKey !== X_API_KEY) { return res.status(403).json({ message: 'Invalid X API Key' }); }
//     next();
// });

app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(express.json());

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

app.get("/", (req, res) => {
    res.send("Server is running")
})

app.use("/media", media)

app.listen(PORT, (req, res) => {
    console.log(`Server is running on PORT ${PORT}`)
})