import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TeacherEduEntity, TeacherProfileEntity } from './entities/teacher-profile.entity';
import { TeacherSkillEntity } from './entities/teacher-skill.entity';
import { TeacherEntity } from './entities/teacher.entity';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([TeacherEntity, TeacherEduEntity, TeacherProfileEntity, TeacherSkillEntity]),
        UsersModule,
    ],
    controllers: [TeachersController],
    providers: [TeachersService],
    exports: [TeachersService],
})
export class TeachersModule {}
