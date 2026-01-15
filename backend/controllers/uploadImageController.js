exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(201).json({
    image_url: `/images/${req.file.filename}`,
  });
};
