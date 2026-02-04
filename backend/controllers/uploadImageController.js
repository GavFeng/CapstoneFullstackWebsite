const { uploadImageToS3 } = require("../config/s3");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const productId = req.body.productId || "general";
    const imageUrl = await uploadImageToS3(req.file.buffer, productId);

    console.log("S3 upload result:", imageUrl); // Debug

    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(500).json({ message: "Failed to generate image URL" });
    }

    const key = `products/${productId}/${Date.now()}.webp`;

    res.status(201).json({ image_url: imageUrl, key });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};
