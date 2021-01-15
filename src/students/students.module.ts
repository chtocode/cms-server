import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { StudentCourseEntity } from './entities/student-course.entity';
import { StudentProfileEntity } from './entities/student-profile.entity';
import { StudentTypeEntity } from './entities/student-type.entity';
import { StudentEntity } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([StudentEntity, StudentProfileEntity, StudentCourseEntity, StudentTypeEntity]),
        UsersModule,
    ],
    controllers: [StudentsController],
    providers: [StudentsService],
    exports: [StudentsService],
})
export class StudentsModule {}
