const express = require("express")
const multer = require("multer")
const Media = require("../models/media")
const { getRandomId } = require("../config/global")
const { cloudinary } = require("../config/cloudinary")

const storage = multer.memoryStorage()
const upload = multer({ storage })
const router = express.Router()

const { MONGODB_NAME } = process.env

router.post("/add", upload.single("image"), async (req, res) => {
    try {

        let url = "", publicId = "", type = "", name = "", id = getRandomId()
        if (req.file) {
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: MONGODB_NAME + '/taxi-Version' },
                    (error, result) => {
                        if (error) { return reject(error); }
                        url = result.secure_url;
                        publicId = result.public_id;
                        name = req.file.originalname;
                        type = req.file.mimetype;
                        resolve();
                    }
                )
                uploadStream.end(req.file.buffer);
            });
        }

        const newData = { id, createdBy: uid, url, publicId, type, name }

        const picture = new Media(newData)
        await picture.save()

        res.status(201).json({ message: "A new screen shot has been successfully added", isError: false, picture })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Something went wrong while adding the new screen short", isError: true, error })
    }
})

module.exports = router;