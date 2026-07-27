const {
  RekognitionClient,
  DetectLabelsCommand,
} = require('@aws-sdk/client-rekognition');

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { doccli } = require('./ddbconn');

const rekognition = new RekognitionClient({
  region: 'us-east-1',
});

const s3 = new S3Client({
  region: 'us-east-1',
});

const CAM_TABLE = process.env.CAM_TABLE;

module.exports.handler = async (event) => {
  try {
    const record = event.Records[0];

    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log('Processing image:', key);

    const image = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const bytes = await streamToBuffer(image.Body);

    const result = await rekognition.send(
      new DetectLabelsCommand({
        Image: {
          Bytes: bytes,
        },
        MaxLabels: 10,
        MinConfidence: 70,
      }),
    );

    const labels = (result.Labels || []).map((label) => label.Name);

    console.log('Detected labels:', labels);

    const animalKeywords = new Set([
      'Animal',
      'Dog',
      'Cat',
      'Deer',
      'Fox',
      'Bear',
      'Bird',
      'Wolf',
      'Horse',
      'Rabbit',
    ]);

    const hasAnimal = labels.some((label) => animalKeywords.has(label));

    console.log('Has animal:', hasAnimal);

    const url = `https://${bucket}.s3.us-east-1.amazonaws.com/${key}`;

    await doccli.send(
      new PutCommand({
        TableName: CAM_TABLE,
        Item: {
          key,
          url,
          hasAnimal,
          labels,
          createdAt: Date.now(),
        },
      }),
    );

    console.log('Saved to DynamoDB');

    return {
      statusCode: 200,
      body: JSON.stringify({
        key,
        url,
        hasAnimal,
        labels,
      }),
    };
  } catch (err) {
    console.error('Image analysis failed:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err.message,
      }),
    };
  }
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
