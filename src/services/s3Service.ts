import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Multer } from 'multer'; // en realidad este import es opcional

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION,
});

const bucket = process.env.AWS_BUCKET_NAME!;

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
  const key = `${uuidv4()}-${file.originalname}`;
  await s3
    .putObject({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
    .promise();
  return key;
};

export const getFileUrl = (key: string): string => {
  return s3.getSignedUrl('getObject', {
    Bucket: bucket,
    Key: key,
    Expires: 60 * 60,
  });
};
