import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

import { IUserRepository } from '@/core/user/repository/user';
import { IHttpAdapter } from '@/infra/http';
import { ISecretsAdapter } from '@/infra/secrets';
import { ITokenAdapter } from '@/libs/token';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly secret: ISecretsAdapter,
    private readonly http: IHttpAdapter,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenAdapter
  ) {}

  getGoogleAuthUrl(): string {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.secret.AUTH.GOOGLE.CLIENT_ID}&redirect_uri=${this.secret.AUTH.GOOGLE.REDIRECT_URL}&response_type=code&scope=profile email`;
  }

  async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    const { code } = req.query;
    const http = this.http.instance();
    const { data } = await http.post('https://oauth2.googleapis.com/token', {
      client_id: this.secret.AUTH.GOOGLE.CLIENT_ID,
      client_secret: this.secret.AUTH.GOOGLE.CLIENT_SECRET,
      code,
      redirect_uri: this.secret.AUTH.GOOGLE.REDIRECT_URL,
      grant_type: 'authorization_code'
    });

    const { access_token } = data;

    const { data: profile } = await http.get<{ name: string; email: string }>(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    const user = await this.userRepository.findByAccountEmail(profile.email);

    if (!user || !user.account) {
      res.redirect(
        `/create-new-password=${
          this.tokenService.sign({
            email: profile.email,
            name: profile.name
          }).token
        }`
      );
      return;
    }

    const tokenNewPassword = this.tokenService.sign({
      email: user.account.email,
      name: profile.name
    });

    if (!user.account.password) {
      res.redirect(`/create-new-password=${tokenNewPassword.token}`);
      return;
    }

    const tokenAuthorization = this.tokenService.sign({
      email: user.account.email,
      name: profile.name,
      id: user.id
    });

    res.redirect(`/home?token=${tokenAuthorization.token}`);
  }
}
