const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Busboy = require('busboy');

const s3 = new S3Client({ region: 'us-east-1' });

module.exports.handler = async (event) => {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: event.headers,
    });

    let uploadPromises = [];

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;

      let chunks = [];

      file.on('data', (data) => {
        chunks.push(data);
      });

      file.on('end', () => {
        const buffer = Buffer.concat(chunks);

        uploadPromises.push(
          s3.send(
            new PutObjectCommand({
              Bucket: 'trail-cam-app',
              Key: `trailcam/${Date.now()}-${filename}`,
              Body: buffer,
              ContentType: mimeType,
            }),
          ),
        );
      });
    });

    busboy.on('finish', async () => {
      await Promise.all(uploadPromises);

      resolve({
        statusCode: 200,
        body: 'ok',
      });
    });

    busboy.end(
      event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body,
    );
  });
};
