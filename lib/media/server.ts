// lib/media/server.ts
import { S3 } from "aws-sdk";
import fs from "fs";

// ☁️ Cloudflare R2 (S3 compatible)
const s3 = new S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: "auto",
});

// ☁️ Upload server-side para R2
export async function uploadFileToR2(
  localPath: string,
  key: string,
  contentType: string
) {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET não definido");

  const fileStream = fs.createReadStream(localPath);

  await s3
    .upload({
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    })
    .promise();
}

// 🗑️ Deletar arquivo do R2
export async function deleteFileFromR2(key: string) {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET não definido");

  await s3
    .deleteObject({
      Bucket: bucket,
      Key: key,
    })
    .promise();
}
