import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { groupBy, isEmpty, isUndefined, omit, omitBy } from 'lodash';
import { Connection, EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { StudentCourseEntity } from '../students/entities/student-course.entity';
import { TeacherEntity } from './../teachers/entities/teacher.entity';
import { UsersService } from './../users/users.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto, UpdateScheduleDto } from './dto/update-course.dto';
import { CourseChapterEntity } from './entities/course-chapter.entity';
import { CourseScheduleEntity } from './entities/course-schedule.entity';
import { CourseTypeEntity } from './entities/course-type.entity';
import { CourseEntity } from './entities/course.entity';
import { SalesEntity } from './entities/sales.entity';
import {
    Course,
    CourseDetailResponse,
    CourseResponse,
    Schedule,
    StudentOwnCoursesResponse
} from './model/course.model';

export interface CourseQuery {
    name?: string;
    type?: string;
    uid?: string;
    teacherId?: number;
    userId?: number;
    page: number;
    limit: number;
}

type RequiredProperties<T, TRequired extends keyof T> = T & { [key in TRequired]-?: T[key] };

export type TeacherCourseQuery = RequiredProperties<CourseQuery, 'userId'>;

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(CourseEntity) private courseRepo: Repository<CourseEntity>,
        @InjectRepository(CourseChapterEntity) private chapterRepo: Repository<CourseChapterEntity>,
        @InjectRepository(CourseScheduleEntity) private scheduleRepo: Repository<CourseScheduleEntity>,
        @InjectRepository(CourseTypeEntity) private typeRepo: Repository<CourseTypeEntity>,
        @InjectRepository(SalesEntity) private saleRepo: Repository<SalesEntity>,
        private usersService: UsersService,
        private connection: Connection,
    ) {}

    async create({ teacherId, type, ...others }: CreateCourseDto): Promise<any> {
        const teacher = await this.connection.getRepository(TeacherEntity).findOne({ id: teacherId });
        const schedule = this.scheduleRepo.create();
        const types = await this.findTypes(type);
        const course = await this.courseRepo.save({ ...others, teacher, type: types, schedule });

        return this.transformCourseEntityToResponse({
            ...omit(course, ['deletedAt', 'schedule']),
            teacher,
        } as CourseEntity);
    }

    async findAll({ name = '%', type = '%', uid = '', teacherId, page, limit }: CourseQuery): Promise<CourseResponse> {
        const selector = this.courseRepo
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.teacher', 'teacher')
            .innerJoinAndSelect('course.type', 'type', `type.name LIKE :type`, { type: '%' + type + '%' })
            .where(
                `course.name like :param ${uid && "AND course.uid = '" + uid + "'"} ${
                    (teacherId && "AND course.teacherId = '" + teacherId + "'") || ''
                }`,
            )
            .setParameters({ param: '%' + name + '%' })
            .orderBy('course.id');
            
        const total = await selector.getCount();
        const courses =
            page && limit
                ? await selector
                      .skip((page - 1) * limit)
                      .take(limit)
                      .getMany()
                : await selector.getMany();

        return {
            courses: courses.map((course) => this.transformCourseEntityToResponse(course)),
            total,
            paginator: { page, limit },
        };
    }

    async findAllBelongTeacher({ name, type, uid, userId, page, limit }: TeacherCourseQuery) {
        const user = await this.usersService.findOne({ id: userId });
        const teacher = await this.connection.getRepository(TeacherEntity).findOne({ email: user.email });

        if (!user) {
            throw new NotFoundException(`Can not find user by id: ${userId}`);
        }

        return this.findAll({ name, type, uid, teacherId: teacher.id, page, limit });
    }

    async findAllBelongStudent({
        name = '%',
        type = '',
        uid = '',
        userId,
        page,
        limit,
    }: CourseQuery): Promise<StudentOwnCoursesResponse> {
        const user = await this.usersService.findOne({ id: userId });
        const selector = this.connection
            .getRepository(StudentCourseEntity)
            .createQueryBuilder('stuCourse')
            .innerJoin('stuCourse.student', 'student', 'student.email = :email', { email: user.email })
            .leftJoinAndSelect(
                'stuCourse.course',
                'course',
                `course.name LIKE :name ${uid && 'AND course.uid = ' + uid} ${(type && 'AND type.id = ' + type) || ''}`,
                { name: '%' + name + '%' },
            )
            .leftJoinAndSelect('course.teacher', 'teacher')
            .innerJoinAndSelect('course.type', 'type', `type.name LIKE :type`, { type: '%' + type + '%' });
        const total = await selector.getCount();
        const courses = await selector
            .orderBy('stuCourse.id')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return {
            courses: courses.map(({ course, ...rest }) => ({
                ...rest,
                course: this.transformCourseEntityToResponse(omit(course, ['schedule', 'deletedAt']) as CourseEntity),
            })),
            total,
            paginator: { page, limit },
        };
    }

    async findOne(id: number): Promise<CourseDetailResponse> {
        const course = await this.courseRepo.findOne(id, {
            relations: ['teacher', 'schedule', 'schedule.chapters', 'type', 'sales'],
        });
        const { teacher, sales } = course;

        return {
            ...course,
            teacherId: teacher.id,
            teacherName: teacher.name,
            sales: { ...sales[0], paidIds: [12, 3] },
        };
    }

    async update(updateCourseDto: UpdateCourseDto): Promise<Course> {
        const { teacherId, ...others } = updateCourseDto;
        const type = await this.findTypes(updateCourseDto.type, true);
        let target: any = type ? { ...others, type } : others;

        if (teacherId) {
            const teacher = await this.connection.getRepository(TeacherEntity).findOne({ id: teacherId });

            target = { ...target, teacher };
        }

        const course = await this.courseRepo.save(target);

        return this.findOne(updateCourseDto.id);
    }

    async remove(id: number): Promise<boolean> {
        const { raw } = await this.courseRepo.softDelete(id);

        return raw.affectedRows >= 1;
    }

    async getCourseSchedule(courseId: number, scheduleId: number): Promise<Schedule> {
        if (!courseId && !scheduleId) {
            throw new NotFoundException(
                `Can not find schedule by the schedule id: ${scheduleId} or course id: ${courseId}`,
            );
        }

        if (!!scheduleId) {
            return this.scheduleRepo
                .createQueryBuilder('schedule')
                .leftJoinAndSelect('schedule.chapters', 'chapters', 'chapters.deletedAt IS NULL')
                .where(`schedule.id = ${scheduleId}`)
                .getOne();
        }

        const course = await this.courseRepo
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.schedule', 'schedule')
            .leftJoinAndSelect('schedule.chapters', 'chapters', 'chapters.deletedAt IS NULL')
            .where(`course.id = ${courseId}`)
            .getOne();

        return course.schedule;
    }

    /**
     * @description * 1. update chapter if id exists;
     * 2. create chapter if id  is null,
     * 3. remove chapter if id  can not find in chapters;
     * 4. update schedule info if needed.
     */
    async updateSchedule(updateScheduleDto: UpdateScheduleDto, manager: EntityManager): Promise<boolean> {
        let { scheduleId, courseId, chapters, classTime, status, current } = updateScheduleDto;
        let schedule: CourseScheduleEntity = null;
        const scheduleRepo = manager.getRepository(CourseScheduleEntity);

        if (scheduleId) {
            schedule = await scheduleRepo.findOne(scheduleId, { relations: ['chapters'] });
        } else if (courseId) {
            const course = await manager
                .getRepository(CourseEntity)
                .findOne(courseId, { relations: ['schedule', 'schedule.chapters'] });

            schedule = course.schedule;
        } else {
            throw new NotFoundException(
                `Can not find schedule by the schedule id: ${scheduleId} or course id: ${courseId}`,
            );
        }

        const { toUpdate, toCreate } = groupBy(chapters, (item) => (!!item.id ? 'toUpdate' : 'toCreate'));
        const chapterRepo = manager.getRepository(CourseChapterEntity);

        // ? operation order ---> update, delete, create;

        if (toUpdate && toUpdate.length) {
            await chapterRepo.save(toUpdate);
        }

        const toDelete =
            chapters && schedule.chapters.filter((oldChapter) => !chapters.find((item) => item.id === oldChapter.id));

        if (toDelete && toDelete.length) {
            await chapterRepo.softDelete(toDelete.map((item) => item.id));
        }

        if (toCreate && toCreate.length) {
            await chapterRepo.save(toCreate.map((item) => chapterRepo.create({ ...item, schedule })));
        }

        const scheduleToUpdate = omitBy({ current, status, classTime }, (item) => isUndefined(item));

        if (!isEmpty(scheduleToUpdate)) {
            await scheduleRepo.update(scheduleId, scheduleToUpdate);
        }

        return true;
    }

    async getCourseTypes(): Promise<CourseTypeEntity[]> {
        return this.typeRepo.createQueryBuilder().getMany();
    }

    createCourseCode(): string {
        return v4();
    }

    private transformCourseEntityToResponse = (course: CourseEntity): Course => {
        const { teacher, ...others } = course;

        return { ...others, teacherId: teacher.id, teacherName: teacher.name };
    };

    private async findTypes(type: number | number[], isUpdate = false): Promise<CourseTypeEntity[] | null> {
        let types = null;

        if (typeof type === 'number') {
            types = await this.typeRepo.findOne({ id: type });
        } else if (Array.isArray(type)) {
            types = await this.typeRepo.find({ where: `id IN (${type.join(',')})` });
        } else {
            if (!isUpdate) {
                throw new NotFoundException(`Can not find types by id/ids: ${type}`);
            }
        }

        return types;
    }
}
