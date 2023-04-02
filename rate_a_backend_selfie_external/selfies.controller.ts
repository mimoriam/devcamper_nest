import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { SelfiesService } from './selfies.service';
import { CreateSelfieDto } from './dto/create-selfie.dto';
import { UpdateSelfieDto } from './dto/update-selfie.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as fs from 'fs';

@Controller('selfies')
export class SelfiesController {
  constructor(private readonly selfiesService: SelfiesService) {}

  @Post()
  create(@Body() createSelfieDto: CreateSelfieDto) {
    return this.selfiesService.create(createSelfieDto);
  }

  @Get()
  findAll() {
    return this.selfiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.selfiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSelfieDto: UpdateSelfieDto) {
    return this.selfiesService.update(+id, updateSelfieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.selfiesService.remove(+id);
  }

  @Auth(AuthType.Bearer)
  @Post('contests')
  async createContest(@ActiveUser() user: ActiveUserData) {
    return this.selfiesService.createContest(user);
  }

  // TODO: Lower bound of uploaded files need to be set on client-side
  @Auth(AuthType.Bearer)
  @Post(':userId/:contestId/uploadToContest')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, callback) => {
          const directory = `./uploads/${req.params.userId}`;

          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }
          callback(null, directory);
        },
        filename(
          req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) {
          const ext = file.mimetype.split('/')[1];
          callback(
            null,
            `user-${new Date().toISOString().split('T')[0]}-${Math.round(
              Math.random() * 1e9,
            )}.${ext}`,
          );
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
      fileFilter(req: Request, file: Express.Multer.File, callback) {
        const whitelist = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!whitelist.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException('File is not allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFiles(
    @Param('userId') userId: string,
    @Param('contestId') contestId: string,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.selfiesService.uploadSelfiesToContest(user, files, contestId);
  }
}
