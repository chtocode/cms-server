import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [AuthModule, UsersModule, TypeOrmModule.forRoot(), StudentsModule, TeachersModule, SharedModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
