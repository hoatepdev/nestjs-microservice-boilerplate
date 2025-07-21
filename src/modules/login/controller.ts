import { Controller, Get, Post, Req, Res, Version } from '@nestjs/common';
import { Request, Response } from 'express';

import { LoginInput, LoginOutput } from '@/core/user/use-cases/user-login';
import { RefreshTokenInput, RefreshTokenOutput } from '@/core/user/use-cases/user-refresh-token';
import { ApiRequest } from '@/utils/request';

import { ILoginAdapter, IRefreshTokenAdapter } from './adapter';
import { GoogleAuthService } from './google-auth.service';

@Controller()
export class LoginController {
  constructor(
    private readonly loginUsecase: ILoginAdapter,
    private readonly refreshTokenUsecase: IRefreshTokenAdapter,
    private readonly googleAuthService: GoogleAuthService
  ) {}

  @Post('login')
  @Version('1')
  async login(@Req() { body, user, tracing }: ApiRequest): Promise<LoginOutput> {
    return this.loginUsecase.execute(body as LoginInput, { user, tracing });
  }

  @Post('refresh')
  @Version('1')
  async refresh(@Req() { body }: ApiRequest): Promise<RefreshTokenOutput> {
    return this.refreshTokenUsecase.execute(body as RefreshTokenInput);
  }

  @Get('login/google')
  @Version('1')
  loginGoogle(@Res() res: Response): void {
    const url = this.googleAuthService.getGoogleAuthUrl();
    res.redirect(url);
  }

  @Get('login/google/callback')
  @Version('1')
  async loginGoogleCallback(@Res() res: Response, @Req() req: Request): Promise<void> {
    await this.googleAuthService.handleGoogleCallback(req, res);
  }
}
