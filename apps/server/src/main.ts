/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
    dotenv.config({ path: envFile });
    
    const app = await NestFactory.create(AppModule);

    /*
      Content Security Policy (CSP): Helps prevent cross-site scripting (XSS) attacks by controlling which resources can be loaded.
      X-DNS-Prefetch-Control: Controls browser DNS prefetching.
      X-Frame-Options: Protects against clickjacking by controlling whether your site can be embedded in an iframe.
      X-Content-Type-Options: Prevents browsers from MIME-sniffing a response away from the declared content type.
      Strict-Transport-Security: Enforces secure (HTTP over SSL/TLS) connections to the server.
      X-XSS-Protection: Enables the Cross-site scripting (XSS) filter built into most browsers.
      */
    // Use helmet middleware for security
    app.use(helmet());

    app.enableCors({
      origin: process.env.CLIENT_FRONTEND_URL || "*",
      methods: 'GET,HEAD',
    });

    // Set global prefix for API routes
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    Logger.log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
    );

  } catch (error) {
    // eslint-disable-next-line no-console
    Logger.error('Error during application bootstrap:', error);
    process.exit(1); // Exit the process with a failure code
  }
}

bootstrap();
