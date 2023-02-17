// import { Process, Processor } from '@nestjs/bull';
import { Job, DoneCallback } from 'bull';
import { Express } from 'express';
import * as sharp from 'sharp';
import * as AdmZip from 'adm-zip';

async function imageProcessor(job: Job, doneCallback: DoneCallback) {
  const files: Express.Multer.File[] = job.data.files;

  const optimizationPromises: Promise<Buffer>[] = files.map((file) => {
    const fileBuffer = Buffer.from(file.buffer);

    return (
      sharp(fileBuffer)
        // .withMetadata()
        .png({
          quality: 80,
          compressionLevel: 6, // This is default value
        })
        .toBuffer()
    );
  });

  const optimizedImages = await Promise.all(optimizationPromises);

  const zip = new AdmZip();

  optimizedImages.forEach((image, index) => {
    const fileData = files[index];
    zip.addFile(fileData.originalname, image);
  });

  doneCallback(null, zip.toBuffer());
}

export default imageProcessor;

// @Processor('optimize_img')
// export class ImageProcessor {
//   // The name of the Process will be the same as the job added to queue, not of the module:
//   @Process('optimize')
//   async handleOptimization(job: Job) {
//     const files: Express.Multer.File[] = job.data.files;
//
//     const optimizationPromises: Promise<Buffer>[] = files.map((file) => {
//       const fileBuffer = Buffer.from(file.buffer);
//
//       return (
//         sharp(fileBuffer)
//           // .withMetadata()
//           .png({
//             quality: 80,
//             compressionLevel: 6, // This is default value
//           })
//           .toBuffer()
//       );
//     });
//
//     const optimizedImages = await Promise.all(optimizationPromises);
//
//     const zip = new AdmZip();
//
//     optimizedImages.forEach((image, index) => {
//       const fileData = files[index];
//       zip.addFile(fileData.originalname, image);
//     });
//
//     return zip.toBuffer();
//   }
// }
