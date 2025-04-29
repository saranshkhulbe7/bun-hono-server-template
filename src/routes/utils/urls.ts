// src/routes/utils/urls.ts
import { Hono, type Context } from 'hono';
import { digitalOceanCreds } from '@/db/configs/digital-ocean-creds';
import { S3Client, PutObjectAclCommand } from '@aws-sdk/client-s3';
import { getUniquePresignedPostUrl } from '@saranshkhulbe/asset-manager-server-utils';
import { z } from 'zod';

/**
 * Route to generate a presigned POST.
 * We expect { file: { fileName, fileType }, folderName, shouldSameUrl } in the body
 */
export async function getSignedUrl(c: Context) {
  try {
    const { file, folderName, shouldSameUrl } = await c.req.json();

    // 1) Validate input
    if (!folderName) {
      return c.json({ error: 'No folderName provided' }, 400);
    }
    if (!file || !file.fileName) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileName: string = file.fileName;
    // Use "application/octet-stream" as fallback if not provided
    const fileType: string = file.fileType || 'application/octet-stream';

    const maxSizeSchema = z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((num) => !isNaN(num) && num > 0 && num <= 500, {
        message: 'MAX_FILE_SIZE_MB must be a number between 1 and 500',
      });
    const maxSizeParsed = maxSizeSchema.safeParse(process.env.MAX_FILE_SIZE_MB);

    const maxSizeMB = maxSizeParsed.success ? maxSizeParsed.data : 2;

    const MAX_FILE_SIZE_BYTES = maxSizeMB * 1024 * 1024;

    // 2) Combine folder name + file name
    //    (Remove trailing slash from folderName, remove leading slash from fileName)
    const safeFolder = folderName.replace(/\/+$/, '');
    const safeFile = fileName.replace(/^\/+/, '');
    const combinedName = `${safeFolder}/${safeFile}`;

    // 3) Generate the presigned POST info (pass fileType)
    const {
      fileName: finalName,
      url,
      fields,
    } = await getUniquePresignedPostUrl(combinedName, digitalOceanCreds, MAX_FILE_SIZE_BYTES, !!shouldSameUrl, fileType);

    // Return data to the client
    return c.json({
      signedUrl: url, // e.g. "https://mybucket.blr1.digitaloceanspaces.com/"
      fields, // { key: "folder/file-uuid.png", "Content-Type": "...", etc. }
      fileName: finalName,
    });
  } catch (err) {
    console.error('Error in getSignedUrl:', err);
    return c.json({ error: 'Failed to generate signed URL' }, 500);
  }
}

/**
 * Route to set an object to public-read (if needed).
 */
async function makePublic(c: Context) {
  try {
    const { file } = await c.req.json();
    if (!file || !file.fileName) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const s3Client = new S3Client({
      region: digitalOceanCreds.region,
      endpoint: `https://${digitalOceanCreds.region}.digitaloceanspaces.com`,
      credentials: {
        accessKeyId: digitalOceanCreds.key,
        secretAccessKey: digitalOceanCreds.secret,
      },
    });

    const command = new PutObjectAclCommand({
      Bucket: digitalOceanCreds.bucket,
      Key: file.fileName, // e.g. "folderName/myFile-uuid.png"
      ACL: 'public-read',
    });
    await s3Client.send(command);

    console.log('Object updated successfully to public-read:', file.fileName);
    return c.json({ status: true, message: 'Object is now public-read' });
  } catch (err) {
    console.error('Error updating ACL:', err);
    return c.json({ error: 'Failed to update ACL' }, 500);
  }
}

export const utilsRouter = new Hono();

// Endpoints
utilsRouter.post('/signed-url', getSignedUrl);
utilsRouter.post('/make-public', makePublic);
