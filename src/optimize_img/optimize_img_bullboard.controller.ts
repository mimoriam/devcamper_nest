import { getBullBoardQueues } from './optimize_img_bullboard.service';
import { All, Controller, Next, Req, Res } from '@nestjs/common';
import { Request, Response, NextFunction, Express } from 'express';
import { createBullBoard, ExpressAdapter } from '@bull-board/express';
import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';

@Controller('/queues/admin')
export class OptimizeImgBullBoardController {
  @Auth(AuthType.None)
  @All('*')
  admin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues/admin');
    const queues = getBullBoardQueues();
    const router = serverAdapter.getRouter() as Express;

    const { addQueue } = createBullBoard({
      queues: [],
      serverAdapter,
    });

    queues.forEach((queue: BaseAdapter) => {
      addQueue(queue);
    });

    const entryPointPath = '/queues/admin/';
    req.url = req.url.replace(entryPointPath, '/');
    router(req, res, next);
  }
}
