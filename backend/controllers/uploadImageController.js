const { uploadImageToS3 } = require("../config/s3");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const productId = req.body.productId || "general";

    const { imageUrl, key } = await uploadImageToS3(req.file.buffer, productId);

    console.log("Uploaded:", { key, imageUrl });

    res.status(201).json({
      image_url: imageUrl,
      key,
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};