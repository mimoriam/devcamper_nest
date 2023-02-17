import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Readable } from 'stream';
import { queuePool } from './optimize_img_bullboard.service';

// https://wanago.io/2021/05/03/api-nestjs-cpu-intensive-tasks-queues/
// This is also good:
// https://www.learmoreseekmore.com/2021/04/guide-on-nestjs-queues.html

@Controller('api/v1/optimize-img')
export class OptimizeImgController {
  constructor(
    // Same name as Bull module registered in Module
    @InjectQueue('optimize_img') private readonly imageQueue: Queue,
  ) {}

  // This method accepts multiple images
  @Post('image')
  @UseInterceptors(AnyFilesInterceptor())
  async processImage(@UploadedFiles() files: Express.Multer.File[]) {
    const job = await this.imageQueue.add('optimize', {
      files,
    });

    // !!NECESSARY for showing in bull-board UI
    queuePool.add(this.imageQueue);

    return {
      jobId: job.id,
    };
  }

  @Get('image/:id')
  async getJobResult(@Res() response: Response, @Param('id') id: string) {
    const job = await this.imageQueue.getJob(id);

    if (!job) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const isCompleted = await job.isCompleted();

    if (!isCompleted) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const result = Buffer.from(job.returnvalue);

    const stream = Readable.from(result);
    stream.pipe(response);
  }
}
