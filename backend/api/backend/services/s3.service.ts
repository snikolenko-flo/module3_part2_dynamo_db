import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const bucketEndpoint = 'http://stanislav-flo-test-bucket.s3.ap-northeast-1.amazonaws.com';


export const uploadToS3 = (data: Buffer, filename: string, bucket: string): void => {
  const client = new S3Client({
    forcePathStyle: true,
    // credentials: {
    //   accessKeyId: 'S3RVER', // This specific key is required when working offline
    //   secretAccessKey: 'S3RVER',
    // },
    //endpoint: 'http://localhost:4569',
    endpoint: bucketEndpoint,
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
