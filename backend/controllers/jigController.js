const Jig = require("../models/Jig");
const Category = require("../models/Category");
const Weight = require("../models/Weight");
const Color = require("../models/Color");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.S3_BUCKET;

// Adding Jig
exports.createJig = async (req, res) => {
  try {
    const name = req.body.name.trim().toLowerCase();
    const existingJig = await Jig.findOne({ name });

    if (existingJig) {
      return res.status(400).json({ message: "Name already exists" });
    }

    // Get Color Order
    const allColors = await Color.find().sort({ name: 1 });
    const colorOrder = allColors.map(c => c._id.toString());

    // Sort colors from request according to order
    let sortedColors = (req.body.colors || []).sort(
      (a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
    );

    // Map each color images  {url, key}
    const formattedColors = sortedColors.map(c => ({
      color: c.color,
      stock: c.stock,
      sold: 0,
      images: (c.images || []).map(img => ({
        url: img.url || img, // handle old string format just in case
        key: img.key || ""
      })),
    }));

    const jig = await Jig.create({
      ...req.body,
      name,
      colors: formattedColors,
    });

    res.status(201).json(jig);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// Viewing All Jigs in DB
exports.getJigs = async (req, res) => {
  try {
    const jigs = await Jig.find()
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");
    res.json(jigs);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Viewing a Jig in DB
exports.getJigById = async (req, res) => {
  try {
    const { id } = req.params;
    const jig = await Jig.findById(id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");
    
    if (!jig) return res.status(404).json({message: "Jig Not Found"});
    res.status(200).json(jig);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

// Deleting a Jig in DB
exports.deleteJig = async (req, res) => {
  try {
    const { id } = req.params;
    const jig = await Jig.findById(id);
    if (!jig) return res.status(404).json({ message: "Jig Not Found" });

    const deletePromises = [];

    for (const color of jig.colors) {
      for (const img of color.images) {
        if (img.key) {
          let key = img.key.trim();
          key = key.replace(/^\/+/, '');

          console.log(`Deleting: ${key}`); // ← keep this for debugging!

          deletePromises.push(
            s3.send(
              new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
              })
            ).catch(err => {
              console.error(`Failed to delete ${key}:`, err);
              throw err;
            })
          );
        }
      }
    }

    await Promise.all(deletePromises);

    await Jig.findByIdAndDelete(id);

    res.status(200).json({ message: "Jig deleted successfully" });
  } catch (err) {
    console.error("Delete jig error:", err);
    res.status(500).json({ message: err.message });
  }
};
// Deleting a color of a Jig in DB
exports.deleteColor = async (req, res) => {
  try {
    const { id, colorId } = req.params;

    const jig = await Jig.findById(id);
    if (!jig) return res.status(404).json({ message: "Jig not found" });

    const initialLength = jig.colors.length;

    jig.colors = jig.colors.filter(c => c.color.toString() !== colorId);

    if (jig.colors.length === initialLength) {
      return res.status(404).json({ message: "Color not found" });
    }

    const updatedJig = await jig.save();

    const populatedJig = await Jig.findById(updatedJig._id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");

    res.status(200).json(populatedJig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Patching a Jig in DB
exports.patchJig = async (req, res) => {
  try {
    const { id } = req.params;
    const { colors, ...rest } = req.body;

    const allowedFields = ['name', 'description', 'price', 'category', 'weight'];
    const updatedFields = {};

    allowedFields.forEach(field => {
      if (rest[field] !== undefined) updatedFields[field] = rest[field];
    });

    updatedFields.updatedAt = Date.now();

    const jig = await Jig.findById(id);
    if (!jig) return res.status(404).json({ message: "Jig not found" });

    const existingColors = jig.colors;

    const incomingColorIds = (colors || [])
      .map(c => c.color?.toString())
      .filter(Boolean);

    const removedColors = existingColors.filter(
      c => !incomingColorIds.includes(c.color.toString())
    );

    const deletePromises = [];

    for (const color of removedColors) {
      for (const img of color.images || []) {
        if (img.key) {
          let key = img.key.trim().replace(/^\/+/, '');

          console.log(`Deleting removed color image: ${key}`);

          deletePromises.push(
            s3.send(
              new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
              })
            ).catch(err => {
              console.error(`Failed to delete ${key}:`, err);
              throw err;
            })
          );
        }
      }
    }

    await Promise.all(deletePromises);

    Object.assign(jig, updatedFields);

    // manage colors
    if (colors && Array.isArray(colors)) {

      // Remove deleted colors from jig
      jig.colors = jig.colors.filter(c =>
        incomingColorIds.includes(c.color.toString())
      );

      // Update or add colors
      colors.forEach(newColor => {
        if (!newColor.color) return;

        const existingColor = jig.colors.find(
          c => c.color.toString() === newColor.color
        );

        const formattedImages = (newColor.images || []).map(img => ({
          url: img.url || img,
          key: img.key || ""
        }));

        if (existingColor) {
          const oldKeys = (existingColor.images || [])
            .map(img => img.key)
            .filter(Boolean);

          const newKeys = (formattedImages || [])
            .map(img => img.key)
            .filter(Boolean);

          const removedKeys = oldKeys.filter(k => !newKeys.includes(k));

          for (const key of removedKeys) {
            const cleanKey = key.trim().replace(/^\/+/, '');
            console.log(`Deleting removed image: ${cleanKey}`);

            deletePromises.push(
              s3.send(
                new DeleteObjectCommand({
                  Bucket: BUCKET_NAME,
                  Key: cleanKey,
                })
              )
            );
          }

          if (newColor.stock !== undefined)
            existingColor.stock = newColor.stock;
          if (newColor.sold !== undefined)
            existingColor.sold = Math.max(0, newColor.sold);

          if (newColor.images !== undefined)
            existingColor.images = formattedImages;
        } else {
          jig.colors.push({
            color: newColor.color,
            stock: newColor.stock || 1,
            sold: newColor.sold || 0,
            images: formattedImages,
          });
        }
      });


      // sorting colors
      const allColors = await Color.find().sort({ name: 1 });
      const colorOrder = allColors.map(c => c._id.toString());

      jig.colors = jig.colors.sort(
        (a, b) =>
          colorOrder.indexOf(a.color.toString()) -
          colorOrder.indexOf(b.color.toString())
      );
    }

    // save + populate
    const updatedJig = await jig.save();

    const populatedJig = await Jig.findById(updatedJig._id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");

    res.status(200).json(populatedJig);

  } catch (err) {
    console.error("Patch jig error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.checkJigName = async (req, res) => {
  try {
    const name = req.query.name?.trim().toLowerCase();
    if (!name) return res.json({ exists: false });

    const existingJig = await Jig.findOne({ name });
    res.json({ exists: !!existingJig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false, message: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { id, colorId } = req.params;
    const { stock, sold, action } = req.body;

    const jig = await Jig.findById(id);
    if (!jig) return res.status(404).json({ message: "Jig not found" });

    const color = jig.colors.find(c => {
      const cId = c.color?._id?.toString() || c.color?.toString();
      return cId === colorId;
    });
    if (!color) return res.status(404).json({ message: "Color not found" });

    if (action === "increment") {
      color.stock += stock || 1;
    } else if (action === "decrement") {
      color.stock = Math.max(0, color.stock - (stock || 1));
    } else if (stock !== undefined) {
      if (stock < 0) return res.status(400).json({ message: "Stock cannot be negative" });
      color.stock = stock;
    }

    if (sold !== undefined) {
      if (sold < 0) return res.status(400).json({ message: "Sold cannot be negative" });
      color.sold = sold;
    }

    await jig.save();

    const populatedJig = await Jig.findById(jig._id)
      .populate("category")
      .populate("weight")
      .populate("colors.color", "name slug");

    res.status(200).json(populatedJig);
  } catch (err) {
    console.error("Update inventory error:", err);
    res.status(500).json({ message: err.message });
  }
};
