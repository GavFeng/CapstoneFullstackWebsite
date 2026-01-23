require("dotenv").config();
const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.S3_BUCKET;
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

const uploadImageToS3 = async (fileBuffer, productId) => {
  const buffer = await sharp(fileBuffer)
    .resize(800)
    .webp({ quality: 80 })
    .toBuffer();

  const key = `products/${productId}/${Date.now()}.webp`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: "image/webp",
  }));

  return `${CLOUDFRONT_URL}/${key}`;
};

module.exports = { uploadImageToS3 };
