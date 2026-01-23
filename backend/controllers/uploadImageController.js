const { uploadImageToS3 } = require("../config/s3");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const productId = req.body.productId || "general"; // optional, can pass productId in body
    const imageUrl = await uploadImageToS3(req.file.buffer, productId);

    res.status(201).json({ image_url: imageUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};