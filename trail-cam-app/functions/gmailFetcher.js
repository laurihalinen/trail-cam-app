const { google } = require('googleapis');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: 'us-east-1',
});

const auth = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
);

auth.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: 'v1',
  auth,
});

// Hakee kaikki MIME-osat myös sisäkkäisistä multipart-viesteistä
function getAttachments(parts = []) {
  const attachments = [];

  for (const part of parts) {
    if (part.parts) {
      attachments.push(...getAttachments(part.parts));
    }

    if (
      part.filename &&
      part.body?.attachmentId &&
      part.mimeType.startsWith('image/')
    ) {
      attachments.push(part);
    }
  }

  return attachments;
}

module.exports.handler = async () => {
  try {
    const list = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread has:attachment newer_than:2d',
    });

    const messages = list.data.messages || [];

    console.log(`Found ${messages.length} email(s)`);

    for (const message of messages) {
      const mail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      const attachments = getAttachments(mail.data.payload.parts || []);

      console.log(`Found ${attachments.length} attachment(s)`);

      for (const part of attachments) {
        const attachment = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: message.id,
          id: part.body.attachmentId,
        });

        const buffer = Buffer.from(
          attachment.data.data.replace(/-/g, '+').replace(/_/g, '/'),
          'base64',
        );

        const key = `trailcam/${Date.now()}-${part.filename}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: 'trail-cam-app',
            Key: key,
            Body: buffer,
            ContentType: part.mimeType,
          }),
        );

        console.log(`Uploaded ${key}`);
      }

      // Merkitään sähköposti luetuksi
      await gmail.users.messages.modify({
        userId: 'me',
        id: message.id,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: messages.length,
      }),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};
