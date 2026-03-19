import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { JwtRefreshTokenGuard } from '../guards/jwt-refresh-token.guard';

@Controller('auth')
export class AuthJwtController {
  @UseGuards(JwtRefreshTokenGuard)
  @Get('refreshtoken')
  async refreshToken(@Req() req: { user: unknown }) {
    return req.user;
  }
}
