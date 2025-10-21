const mongoose = require("mongoose")
const { Schema } = mongoose

const schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, default: "" },
    url: { type: String, required: true, default: "" },
    type: { type: String, required: true, default: "" },
    publicId: { type: String, required: true, default: "" },
}, { timestamps: true })

const Media = mongoose.model("media", schema)

module.exports = Media