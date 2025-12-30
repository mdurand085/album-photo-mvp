const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ 
  region: process.env.AWS_REGION || "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

export default async function handler(req, res) {
  try {
    const bucketName = "album-photo-test-01";
    const data = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));
    
    // On simplifie au maximum pour l'affichage immédiat
    const photos = data.Contents.map(file => ({
      name: file.Key,
      status: file.Key.toLowerCase().includes("screenshot") ? "bad" : "good",
      url: `https://${bucketName}.s3.eu-west-3.amazonaws.com/${file.Key}`
    }));

    res.status(200).json(photos);
  } catch (error) {
    // Si ça plante, on veut voir pourquoi
    res.status(500).json({ error: error.message, details: error.stack });
  }
}
