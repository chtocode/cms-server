import { Injectable } from '@nestjs/common';
import { endOfMonth, format, formatDistance, startOfMonth, subMonths } from 'date-fns';
import { countBy, flatten, groupBy } from 'lodash';
import { Connection } from 'typeorm';
import { EntityWithDateRange } from '../base/entity';
import { CourseTypeEntity } from '../course/entities/course-type.entity';
import { Role } from '../role/role.enum';
import { Gender } from '../shared/constant/gender';
import { Student, StudentProfile } from '../students/model/students.model';
import { TeacherSkillEntity } from '../teachers/entities/teacher-skill.entity';
import { CourseEntity } from './../course/entities/course.entity';
import { StudentCourseEntity } from './../students/entities/student-course.entity';
import { StudentProfileEntity } from './../students/entities/student-profile.entity';
import { StudentEntity } from './../students/entities/student.entity';
import { TeacherProfileEntity } from './../teachers/entities/teacher-profile.entity';
import { TeacherEntity } from './../teachers/entities/teacher.entity';
import { UserEntity } from './../users/entities/user.entity';
import { Statistic, StatisticsOverviewResponse } from './model/statistics.model';

type TransformedCourseEntity = Omit<CourseEntity, 'type'> & { type: CourseTypeEntity };

function getStatisticList(obj: { [key: string]: number }) {
    return Object.entries(obj).map(([name, amount]) => ({ name, amount }));
}

function getCtimeStatistics(source: TransformedCourseEntity[]) {
    return getStatisticList(
        countBy(source, (item) => {
            const index = ((item.createdAt as unknown) as string).lastIndexOf('-');

            return ((item.createdAt as unknown) as string).slice(0, index);
        }),
    );
}

/**
 * @function getCourseStatistics
 * @param {Course[]} source - course collections
 */
function getCourseStatistics(source: TransformedCourseEntity[]) {
    return {
        type: getStatisticList(countBy(source, (item) => item.type.name)),
        createdAt: getCtimeStatistics(source),
        classTime: Object.entries(
            groupBy(
                source.map((course) => {
                    const classTime = course.schedule.classTime;
                    const typeName = course.type.name;

                    return { classTime, typeName, name: course.name };
                }),
                (item) => item.typeName,
            ),
        ).map(([name, values]) => ({
            name,
            amount: values.length,
            courses: values,
        })),
    };
}

function getDuration(data: EntityWithDateRange[], key = 'startEnd'): string {
    const dates: (string | Date)[] = flatten(data.map((item) => [item.startAt, item.endAt]));
    const { max, min } = dates.reduce(
        (acc, cur) => {
            const date = new Date(cur).getTime();
            const { max, min } = acc;

            return { max: date > max ? date : max, min: date < min ? date : min };
        },
        { max: new Date().getTime(), min: new Date().getTime() },
    );

    return formatDistance(new Date(min), new Date(max));
}

@Injectable()
export class StatisticsService {
    readonly dateFormat = 'yyyy-MM-dd';

    constructor(private connection: Connection) {}

    async getOverview(): Promise<StatisticsOverviewResponse> {
        const month = subMonths(new Date(), 1);
        const mStart = format(startOfMonth(month), this.dateFormat);
        const mEnd = format(endOfMonth(month), this.dateFormat);
        const condition = `DATE_FORMAT(createdAt,'%Y-%m-%d') >= :mStart and DATE_FORMAT(createdAt,'%Y-%m-%d') <= :mEnd`;
        const genSql = (role: Role) => `
            select p.gender, count(p.gender) as amount
            from cms.${role}_entity as e left join cms.${role}_profile_entity as p 
            on p.id = e.profileId
            where e.deletedAt IS NULL
            group by gender;
        `;
        // course
        const courseRepo = this.connection.getRepository(CourseEntity);
        const courseAdded = await courseRepo
            .createQueryBuilder('course')
            .select(['course.createdAt'])
            .where(condition)
            .setParameters({ mStart, mEnd })
            .getCount();
        const courseTotal = await courseRepo.count();
        // student
        const stuRepo = this.connection.getRepository(StudentEntity);
        const stuTotal = await stuRepo.count();
        const stuAdded = await stuRepo
            .createQueryBuilder('student')
            .select(['student.createdAt'])
            .where(condition)
            .setParameters({ mStart, mEnd })
            .getCount();

        const stuGenderRaw = await stuRepo.query(genSql(Role.Student));
        const stuGender = stuGenderRaw.reduce((acc, cur) => ({ ...acc, [Gender[cur.gender || 0]]: +cur.amount }), {});
        // teacher
        const teaRepo = this.connection.getRepository(TeacherEntity);
        const teaTotal = await teaRepo.count();
        const teaAdded = await teaRepo
            .createQueryBuilder('teacher')
            .select(['teacher.createdAt'])
            .where(condition)
            .setParameters({ mStart, mEnd })
            .getCount();
        const teaGenderRaw = await teaRepo.query(genSql(Role.Teacher));
        const teaGender = teaGenderRaw.reduce((acc, cur) => ({ ...acc, [Gender[cur.gender || 0]]: +cur.amount }), {});

        return {
            course: { lastMonthAdded: courseAdded, total: courseTotal },
            student: { lastMonthAdded: stuAdded, total: stuTotal, gender: stuGender },
            teacher: { lastMonthAdded: teaAdded, total: teaTotal, gender: teaGender },
        };
    }

    /**
     * @description student statistics of teacher;
     */
    async getStudentStatisticForTeacher(userId: number) {
        const userRepo = this.connection.getRepository(UserEntity);
        const user = await userRepo.findOne(userId);
        const month = subMonths(new Date(), 1);
        const mStart = format(startOfMonth(month), this.dateFormat);
        const mEnd = format(endOfMonth(month), this.dateFormat);
        const studentBuilder = this.connection
            .getRepository(StudentEntity)
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.courses', 'courses')
            .leftJoinAndSelect('courses.course', 'course')
            .innerJoinAndSelect('course.teacher', 'teacher', `teacher.email = '${user.email}'`);
        const total = await studentBuilder.getCount();
        const lastMonthAdded = await studentBuilder
            .where(
                `DATE_FORMAT(courses.createdAt,'%Y-%m-%d') >= :mStart and DATE_FORMAT(courses.createdAt,'%Y-%m-%d') <= :mEnd`,
            )
            .setParameters({ mStart, mEnd })
            .getCount();

        return { total, lastMonthAdded };
    }

    /**
     * @description statistics of student;
     */
    async getStudentStatisticForStudent(userId: number) {
        const userRepo = this.connection.getRepository(UserEntity);
        const user = await userRepo.findOne(userId);
        const student = await this.connection
            .getRepository(StudentEntity)
            .findOne({ email: user.email }, { relations: ['courses', 'courses.course', 'courses.course.type'] });
        const profile = await this.connection
            .getRepository(StudentProfileEntity)
            .findOne({ email: user.email }, { relations: ['interest'] });
        const interestNames = profile.interest.map((item) => item.name);
        const courses = await this.connection
            .getRepository(CourseEntity)
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.teacher', 'teacher')
            .innerJoinAndSelect(
                'course.type',
                'type',
                `type.name IN (${interestNames.map((name) => "'" + name + "'").join(',')})`,
            )
            .getManyAndCount();

        return {
            own: { name: 'own', amount: student.courses.length, courses: student.courses },
            recommend: {
                name: 'interest',
                amount: courses[1],
                courses: courses[0].map(({ teacher, ...rest }) => ({ ...rest, teacherName: teacher.name })),
            },
        };
    }

    async getStudentStatisticForManager(): Promise<
        Partial<{ [key in keyof Student | keyof StudentProfile]: Statistic[] }>
    > {
        const stuRepo = this.connection.getRepository(StudentEntity);
        const country = await stuRepo
            .createQueryBuilder('student')
            .select('student.country as country')
            .addSelect('COUNT(*) AS amount')
            .groupBy('student.country')
            .getRawMany();
        const createdAt = await stuRepo
            .createQueryBuilder('student')
            .select(`date_format(student.createdAt, '%Y-%m') as month`)
            .addSelect('COUNT(*) AS amount')
            .where(`year(student.createdAt) = year(now())`)
            .groupBy('month')
            .getRawMany();
        const type = await stuRepo
            .createQueryBuilder('student')
            .innerJoinAndSelect('student.type', 'type')
            .select('type.name AS typeName')
            .addSelect('COUNT(*) AS amount')
            .groupBy('typeName')
            .getRawMany();
        const courses = await this.connection
            .getRepository(StudentCourseEntity)
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.course', 'course')
            .select('course.name AS courseName')
            .addSelect('COUNT(*) AS amount')
            .groupBy('courseName')
            .getRawMany();
        const interest = await this.connection
            .getRepository(StudentProfileEntity)
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.interest', 'interest')
            .select('interest.name AS interestName')
            .addSelect('COUNT(*) AS amount')
            .groupBy('interestName')
            .getRawMany();

        return {
            country: country.map(({ country, amount }) => ({ name: country, amount: +amount })),
            type: type.map(({ typeName, amount }) => ({ name: typeName, amount: +amount })),
            courses: courses.map(({ courseName, amount }) => ({ name: courseName, amount: +amount })),
            createdAt: createdAt.map(({ month, amount }) => ({ name: month, amount: +amount })),
            interest: interest
                .filter((item) => !!item.interestName)
                .map(({ interestName, amount }) => ({
                    name: interestName,
                    amount: +amount,
                })),
        };
    }

    async getTeacherStatisticsForManger() {
        const teacherRepo = this.connection.getRepository(TeacherEntity);
        const country = await teacherRepo
            .createQueryBuilder('teacher')
            .select('teacher.country as country')
            .addSelect('COUNT(*) AS amount')
            .groupBy('teacher.country')
            .getRawMany();
        const createdAt = await teacherRepo
            .createQueryBuilder('teacher')
            .select(`date_format(teacher.createdAt, '%Y-%m') as month`)
            .addSelect('COUNT(*) AS amount')
            .where(`year(teacher.createdAt) = year(now())`)
            .groupBy('month')
            .getRawMany();

        const skillsSource = await this.connection
            .getRepository(TeacherSkillEntity)
            .createQueryBuilder('skills')
            .leftJoinAndSelect('skills.courseType', 'skill')
            .select(['skill.name as name', 'skills.level as level'])
            .getRawMany();
        const skills: { [key: string]: { name: string; amount: number }[] } = skillsSource.reduce((acc, cur) => {
            const { name, level } = cur;

            if (acc.hasOwnProperty(name)) {
                const target = acc[name].find((item) => item.level === level);

                if (target) {
                    target.amount = target.amount + 1;
                } else {
                    acc[name].push({ name: 'level', level, amount: 1 });
                }
            } else {
                acc[name] = [{ name: 'level', level, amount: 1 }];
            }
            return acc;
        }, {});
        const workExperienceSource = await this.connection
            .getRepository(TeacherProfileEntity)
            .createQueryBuilder('profile')
            .leftJoinAndSelect('profile.workExperience', 'exp')
            .select(['profile.id', 'exp'])
            .getMany();
        const workExperience = workExperienceSource.map((teacher) => getDuration(teacher.workExperience));

        return {
            country: country.map(({ country, amount }) => ({ name: country, amount: +amount })),
            createdAt: createdAt.map(({ month, amount }) => ({ name: month, amount: +amount })),
            skills,
            workExperience,
        };
    }

    async getCourseStatisticsForTeacher(userId: number) {
        const user = await this.connection.getRepository(UserEntity).findOne(userId);
        const courses = await this.courseBuilder()
            .where(`teacher.email = :email`)
            .setParameters({
                email: user.email,
            })
            .getMany();
        const source = flatten(
            courses.map(({ type, schedule, ...rest }) => type.map((item) => ({ type: item, schedule, ...rest }))),
        );
        const statistics = getCourseStatistics(source);
        const status = getStatisticList(countBy(source, (item) => item.status));

        return { ...statistics, status };
    }

    async getCourseStatisticsForManager() {
        const courses = await this.courseBuilder().getMany();
        const source = flatten(
            courses.map(({ type, schedule, ...rest }) => type.map((item) => ({ type: item, schedule, ...rest }))),
        );
        const statistics = getCourseStatistics(source);

        return statistics;
    }

    private courseBuilder() {
        return this.connection
            .getRepository(CourseEntity)
            .createQueryBuilder('course')
            .leftJoin('course.teacher', 'teacher')
            .leftJoinAndSelect('course.type', 'type')
            .leftJoinAndSelect('course.schedule', 'schedule');
    }
}
