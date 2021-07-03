import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';

function useProd(app: INestApplication): void {
    app.use(
        helmet({
            contentSecurityPolicy: false,
        }),
    );

    app.use(cookieParser());

    app.use(csurf({ cookie: true }));

    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
        }),
    );
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const isProd = configService.get('IS_PROD');
    const port = configService.get('PORT');

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    app.setGlobalPrefix('api');

    app.enableCors({ origin: ['http://localhost:3000', 'https://cms-lyart.vercel.app'], credentials: true });

    if (isProd) {
        useProd(app);
    }

    const options = new DocumentBuilder()
        .setTitle('CMS')
        .setDescription('Course Manager System')
        .setVersion('1.0')
        .addServer(isProd ? 'https://' : 'http://')
        .addTag('cms', 'cms public api')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('swagger', app, document);

    await app.listen(port);
}
bootstrap();
