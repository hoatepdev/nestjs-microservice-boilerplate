import './utils/tracing';

import { RequestMethod, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import bodyParser from 'body-parser';
import { bold } from 'colorette';
import compression from 'compression';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { IncomingMessage, ServerResponse } from 'http';

import { ILoggerAdapter } from '@/infra/logger/adapter';
import { ISecretsAdapter } from '@/infra/secrets';
import { ExceptionHandlerFilter } from '@/middlewares/filters';

import { name } from '../package.json';
import { AppModule } from './app.module';
import { ErrorType } from './infra/logger';
import { CryptoUtils } from './utils/crypto';
import { changeLanguage, initI18n, LocaleInput } from './utils/validator';

function getLocale(req: Request) {
  const queryLang = req.query.lang;
  const acceptLang = req.headers['accept-language'];
  return [queryLang, (acceptLang || '').split(',')[0].split(';')[0], 'en'].find(Boolean);
}

function setNonce(res: Response) {
  const nonce = CryptoUtils.generateRandomBase64();
  res.locals.nonce = nonce;
  res.setHeader('X-Content-Security-Policy-Nonce', nonce);
}

function languageAndNonceMiddleware(req: Request, res: Response, next: NextFunction) {
  changeLanguage(getLocale(req) as LocaleInput).then(() => {
    if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
      res.sendStatus(204);
      return;
    }
    setNonce(res);
    next();
  });
}

function getHelmetConfig() {
  return {
    xssFilter: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
        imgSrc: [`'self'`, 'data:', 'blob:', 'validator.swagger.io'],
        scriptSrc: [
          "'self'",
          (req: IncomingMessage, res: ServerResponse) => {
            return `'nonce-${(res as unknown as { locals: { nonce: string } }).locals.nonce}'`;
          }
        ]
      }
    }
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, cors: true });
  const loggerService = app.get(ILoggerAdapter);
  loggerService.setApplication(name);
  app.useLogger(loggerService);
  app.useGlobalFilters(new ExceptionHandlerFilter(loggerService));
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'alert', method: RequestMethod.POST },
      { path: '/', method: RequestMethod.GET }
    ]
  });
  await initI18n();
  app.use(languageAndNonceMiddleware);
  app.use(helmet(getHelmetConfig()));
  app.use(compression());
  const {
    ENV,
    MONGO: { MONGO_URL, MONGO_EXPRESS_URL },
    POSTGRES: { POSTGRES_URL, POSTGRES_PGADMIN_URL },
    PORT,
    HOST,
    ZIPKIN_URL,
    PROMETHUES_URL,
    GRAFANA_URL,
    IS_PRODUCTION
  } = app.get(ISecretsAdapter);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.enableVersioning({ type: VersioningType.URI });
  process.on('uncaughtException', (error) => {
    loggerService.error(error as ErrorType);
  });
  process.on('unhandledRejection', (error) => {
    loggerService.error(error as ErrorType);
  });
  if (!IS_PRODUCTION) {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API documentation')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api-docs', app, document);
  }
  await app.listen(PORT, () => {
    loggerService.log(`🟢 ${name} listening at ${bold(PORT)} on ${bold(ENV?.toUpperCase())} 🟢`);
    if (!IS_PRODUCTION) loggerService.log(`🟢 Swagger listening at ${bold(`${HOST}/api-docs`)} 🟢`);
  });
  loggerService.log(`🔵 Postgres listening at ${bold(POSTGRES_URL)}`);
  loggerService.log(`🔶 PgAdmin listening at ${bold(POSTGRES_PGADMIN_URL)}\n`);
  loggerService.log(`🔵 Mongo listening at ${bold(MONGO_URL)}`);
  loggerService.log(`🔶 Mongo express listening at ${bold(MONGO_EXPRESS_URL)}\n`);
  loggerService.log(`⚪ Grafana[${bold('Graphs')}] listening at ${bold(GRAFANA_URL)}`);
  loggerService.log(`⚪ Zipkin[${bold('Tracing')}] listening at ${bold(ZIPKIN_URL)}`);
  loggerService.log(`⚪ Promethues[${bold('Metrics')}] listening at ${bold(PROMETHUES_URL)}\n`);
}

bootstrap();
