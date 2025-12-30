const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { RekognitionClient, DetectLabelsCommand } = require("@aws-sdk/client-rekognition");

const s3 = new S3Client({ region: process.env.AWS_REGION });
const rekognition = new RekognitionClient({ region: process.env.AWS_REGION });

export default async function handler(req, res) {
  try {
    const bucketName = "album-photo-test-01";
    const data = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));
    
    const analysisResults = await Promise.all(data.Contents.map(async (file) => {
      const params = {
        Image: { S3Object: { Bucket: bucketName, Name: file.Key } },
        Features: ["GENERAL_LABELS", "IMAGE_PROPERTIES"]
      };
      
      const analysis = await rekognition.send(new DetectLabelsCommand(params));
      
      let status = "good"; 
      let reason = "";

      // Logique de tri simple pour le test
      if (file.Key.toLowerCase().includes("screenshot") || file.Key.toLowerCase().includes("capture")) {
        status = "bad";
        reason = "Capture d'écran détectée";
      }

      return { 
        name: file.Key, 
        status, 
        reason, 
        url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}` 
      };
    }));

    res.status(200).json(analysisResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
