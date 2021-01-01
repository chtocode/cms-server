import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const options = new DocumentBuilder()
        .setTitle('CMS')
        .setDescription('Course Manager System')
        .setVersion('1.0')
        .addServer('http://')
        .addTag('cms', 'cms public api')
        .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('swagger', app, document);

    await app.listen(3000);
}
bootstrap();
