import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { CourseModule } from './course/course.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { MessageModule } from './message/message.module';
import { SharedModule } from './shared/shared.module';
import { StatisticsModule } from './statistics/statistics.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { UsersModule } from './users/users.module';
import { validate } from './utils/env.validation';

const envFilePath: string | string[] = process.env.NODE_ENV === 'production' ? '.env' : '.dev.env';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            envFilePath,
            validate,
        }),
        MessageModule,
        SharedModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client'),
            exclude: ['/api*'],
        }),
        StudentsModule,
        TeachersModule,
        TypeOrmModule.forRoot(),
        UsersModule,
        CourseModule,
        StatisticsModule,
        ClassModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {}
