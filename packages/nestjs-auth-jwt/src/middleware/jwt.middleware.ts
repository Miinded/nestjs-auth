import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    passport.authenticate('jwt', (err: unknown, user?: Express.User | false | null, _info?: object | string | Array<string | undefined>, _status?: number | Array<number | undefined>) => {
      if (err || !user) {
        res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
        });
        return;
      }
      req.user = user;
      next();
    })(req, res, next);
  }
}
