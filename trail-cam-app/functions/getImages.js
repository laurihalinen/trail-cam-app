const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const ddb = new DynamoDBClient({ region: 'us-east-1' });
const s3 = new S3Client({ region: 'us-east-1' });

module.exports.handler = async () => {
  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: 'trailcam-images',
      }),
    );

    const images = await Promise.all(
      (result.Items || []).map(async (item) => {
        const key = item.key.S;

        const command = new GetObjectCommand({
          Bucket: 'trail-cam-app',
          Key: key,
        });

        const url = await getSignedUrl(s3, command, {
          expiresIn: 3600, // 1h
        });

        return {
          key,
          url,
          hasAnimal: item.hasAnimal.BOOL,
          labels: JSON.parse(item.labels.S),
          createdAt: Number(item.createdAt.N),
        };
      }),
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(images),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
