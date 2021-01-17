import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { CourseEntity } from './../course/entities/course.entity';
import { StudentCourseEntity } from './../students/entities/student-course.entity';
import { ClassSchedule } from './model/class.model';

@Injectable()
export class ClassService {
    constructor(private connection: Connection) {}

    async getClassScheduleForTeacher(user: Pick<UserEntity, 'id' | 'email' | 'role'>): Promise<ClassSchedule[]> {
        const courseSource = await this.connection
            .getRepository(CourseEntity)
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.type', 'type')
            .leftJoinAndSelect('course.schedule', 'schedule')
            .leftJoinAndSelect('schedule.chapters', 'chapters')
            .leftJoinAndSelect('course.teacher', 'teacher')
            .where('teacher.email = :email')
            .setParameters({
                email: user.email,
            })
            .getMany();

        return this.toResponse(courseSource);
    }

    async getClassScheduleForStudent(user: Pick<UserEntity, 'id' | 'email' | 'role'>): Promise<ClassSchedule[]> {
        const courseSource = await this.connection
            .getRepository(StudentCourseEntity)
            .createQueryBuilder('stuCourse')
            .leftJoinAndSelect('stuCourse.course', 'course')
            .leftJoinAndSelect('course.type', 'type')
            .leftJoinAndSelect('course.schedule', 'schedule')
            .leftJoinAndSelect('course.teacher', 'teacher')
            .leftJoinAndSelect('schedule.chapters', 'chapters')
            .innerJoin('stuCourse.student', 'student')
            .where('student.email = :email')
            .setParameters({
                email: user.email,
            })
            .getMany();

        return this.toResponse(courseSource.map(({ course }) => course));
    }

    private toResponse(courses: CourseEntity[]): ClassSchedule[] {
        return courses.map(({ teacher, ...rest }) => ({
            ...rest,
            teacherName: teacher.name,
        }));
    }
}
