import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OptimizeImgController } from './optimize_img.controller';
// import { ImageProcessor } from './optimize_img.processor';
import { join } from 'path';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'optimize_img',
      processors: [
        // Define the name of the consumer/processor and which location it is in:
        {
          name: 'optimize',
          path: join(__dirname, 'optimize_img.processor.js'),
        },
      ],
    }),
  ],
  // Don't forget to add Processors/Consumers into providers:
  // No need to add Processors/Consumers into providers if defined above in processors via multiprocess scheduling:
  // providers: [ImageProcessor],
  controllers: [OptimizeImgController],
})
export class OptimizeImgModule {}
