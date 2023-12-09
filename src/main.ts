import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  app.use(compression());
  app.use(helmet());

  const configService = app.get(ConfigService);

  const PORT = configService.get('PORT');

  const config = new DocumentBuilder()
    .setTitle('Bulk Action APIs')
    .setDescription('Bulk Actions done fast, at once.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT);
  Logger.log(
    `BulkAction API Server is live @: http://localhost:${PORT}`,
    'Bootstrap',
  );
  Logger.log(
    `BulkAction API Docs available @: http://localhost:${PORT}/api/docs`,
    'Bootstrap',
  );
}

bootstrap();
