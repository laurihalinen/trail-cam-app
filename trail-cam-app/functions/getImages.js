const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const { doccli } = require('./ddbconn');

const s3 = new S3Client({
  region: 'us-east-1',
});

const CAM_TABLE = process.env.CAM_TABLE;

module.exports.handler = async () => {
  try {
    const result = await doccli.send(
      new ScanCommand({
        TableName: CAM_TABLE,
      }),
    );

    const images = await Promise.all(
      (result.Items || []).map(async (item) => {
        const command = new GetObjectCommand({
          Bucket: 'trail-cam-app',
          Key: item.key,
        });

        const url = await getSignedUrl(s3, command, {
          expiresIn: 3600,
        });

        return {
          key: item.key,
          url,
          hasAnimal: item.hasAnimal,
          labels: item.labels,
          createdAt: item.createdAt,
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
      body: JSON.stringify({
        message: err.message,
      }),
    };
  }
};
