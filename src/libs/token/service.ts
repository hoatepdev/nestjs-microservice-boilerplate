import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { ISecretsAdapter } from '@/infra/secrets';
import { ApiUnauthorizedException } from '@/utils/exception';
import { InputValidator } from '@/utils/validator';

import { ITokenAdapter } from './adapter';

export const TokenGetSchema = InputValidator.object({
  email: InputValidator.string().email(),
  name: InputValidator.string(),
  id: InputValidator.string().uuid()
});

@Injectable()
export class TokenService implements ITokenAdapter {
  constructor(private readonly secret: ISecretsAdapter) {}

  sign<TOpt = jwt.SignOptions>(model: SignInput, options?: TOpt): SignOutput {
    const token = jwt.sign(
      model,
      this.secret.JWT_SECRET_KEY,
      options || {
        expiresIn: this.secret.TOKEN_EXPIRATION as jwt.SignOptions['expiresIn']
      }
    );

    return { token };
  }

  async verify<T>(token: string): Promise<T> {
    return new Promise((res, rej) => {
      jwt.verify(token, this.secret.JWT_SECRET_KEY, (error, decoded) => {
        if (error) rej(new ApiUnauthorizedException(error.message));

        res(decoded as T);
      });
    });
  }
}

export type SignInput =
  | {
      email: string;
      name: string;
      id: string;
    }
  | {
      userId: string;
    };

export type SignOutput = {
  token: string;
};
