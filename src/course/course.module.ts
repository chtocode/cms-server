import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseChapterEntity } from './entities/course-chapter.entity';
import { CourseScheduleEntity } from './entities/course-schedule.entity';
import { CourseTypeEntity } from './entities/course-type.entity';
import { CourseEntity } from './entities/course.entity';
import { SalesEntity } from './entities/sales.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CourseEntity,
            CourseTypeEntity,
            CourseScheduleEntity,
            SalesEntity,
            CourseChapterEntity,
        ]),
        UsersModule,
    ],
    controllers: [CourseController],
    providers: [CourseService],
    exports: [CourseService],
})
export class CourseModule {}
