import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const uploadToS3 = (data, filename, bucket) => {
  console.log('uploadToS3 service is triggered.');
  const client = new S3Client({
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'S3RVER', // This specific key is required when working offline
      secretAccessKey: 'S3RVER',
    },
    endpoint: 'http://localhost:4569',
  });

  client
    .send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: Buffer.from(data),
      })
    )
    .then(() => console.log(`File ${filename} is uploaded to the bucket ${bucket}`))
    .catch((e) => console.log(`The error ${e} has happened`));
};
