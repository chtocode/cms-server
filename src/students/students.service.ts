import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omitBy } from 'lodash';
import { Connection, Repository } from 'typeorm';
import { TeacherEntity } from '../teachers/entities/teacher.entity';
import { CourseEntity } from './../course/entities/course.entity';
import { CourseShort } from './../course/model/course.model';
import { UsersService } from './../users/users.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentProfileEntity } from './entities/student-profile.entity';
import { StudentTypeEntity } from './entities/student-type.entity';
import { StudentEntity } from './entities/student.entity';
import { Student, StudentProfile, StudentsResponse } from './model/students.model';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(StudentEntity) private studentRepo: Repository<StudentEntity>,
        @InjectRepository(StudentProfileEntity) private studentProfileRepo: Repository<StudentProfileEntity>,
        @InjectRepository(StudentTypeEntity) private studentTypeRepo: Repository<StudentTypeEntity>,
        private usersService: UsersService,
        private connection: Connection,
    ) {}

    async create(createStudentDto: CreateStudentDto): Promise<Student> {
        const { name, email, country } = createStudentDto;
        const profile = this.studentProfileRepo.create({ name, email, country });
        const type = await this.studentTypeRepo.findOne({ id: createStudentDto.type });
        const { profile: _1, deletedAt: _2, ...student } = await this.studentRepo.save({
            name,
            email,
            country,
            type,
            profile,
        });

        return this.transformStudentEntityToResponse({ ...(student as StudentEntity), courses: [], type });
    }

    async findAllBelongTeacher(userId: number, page: number, limit: number, query = ''): Promise<StudentsResponse> {
        const user = await this.usersService.findOne({ id: userId });
        const teacher = await this.connection.getRepository(TeacherEntity).findOne({ email: user.email });
        const courses = await this.connection
            .getRepository(CourseEntity)
            .createQueryBuilder('course')
            .where(`course.teacherId = ${teacher.id}`)
            .select('course.id')
            .getMany();
        const courseIds = courses.map(({ id }) => id).join(',');
        const total = await this.studentRepo
            .createQueryBuilder('student')
            .innerJoin('student.courses', 'courses')
            .where(`courses.course IN (${courseIds})`)
            .getCount();
        const result = await this.studentRepo
            .createQueryBuilder('student')
            .innerJoinAndSelect('student.courses', 'courses')
            .innerJoinAndSelect('courses.course', 'course')
            .leftJoinAndSelect('student.type', 'type')
            .where(`student.name LIKE :param AND courses.courseId IN (${courseIds})`)
            .setParameters({ param: '%' + query + '%' })
            .orderBy('student.id')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        const students: Student[] = result.map(this.transformStudentEntityToResponse);

        return { total, students, paginator: { page, limit } };
    }

    async findAll(page: number, limit: number, query = ''): Promise<StudentsResponse> {
        const total = await this.studentRepo
            .createQueryBuilder('student')
            .where('student.name LIKE :param')
            .setParameters({
                param: '%' + query + '%',
            })
            .getCount();
        const result = await this.studentRepo
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.courses', 'courses')
            .leftJoinAndSelect('courses.course', 'course')
            .leftJoinAndSelect('student.type', 'type')
            .where('student.name LIKE :param')
            .setParameters({
                param: '%' + query + '%',
            })
            .orderBy('student.id')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        const students: Student[] = result.map(this.transformStudentEntityToResponse);

        return { total, students, paginator: { page, limit } };
    }

    async findOne(
        id: number,
    ): Promise<Student<CourseShort & { name: string; courseId: number; studentId: number }> & StudentProfile> {
        const { profile, courses, type, ...others } = await this.studentRepo.findOne(
            { id },
            { relations: ['type', 'courses', 'profile', 'profile.interest', 'courses.course', 'courses.course.type'] },
        );
        const { id: profileId, interest, ...restProfile } = profile;

        return {
            ...others,
            ...restProfile,
            type: { id: type.id, name: type.name },
            courses: courses.map(({ course, ...other }) => ({
                ...other,
                name: course.name,
                courseId: course.id,
                studentId: id,
                type: course.type,
            })),
            interest: interest.map((item) => item.name),
        };
    }

    async update(updateStudentDto: UpdateStudentDto): Promise<Student> {
        const { id, name, country, email, type: typeId } = updateStudentDto;
        const type = await this.studentTypeRepo.findOne({ id: typeId });
        const values = omitBy({ name, country, email, type }, (item) => !item);

        await this.studentRepo.save({ id, ...values });

        const result = await this.studentRepo.findOne({ id }, { relations: ['type', 'courses', 'courses.course'] });

        return this.transformStudentEntityToResponse(result);
    }

    async remove(id: number): Promise<boolean> {
        const { raw } = await this.studentRepo.softDelete({ id });

        return raw.affectedRows >= 1;
    }

    private transformStudentEntityToResponse = (student: StudentEntity): Student => {
        const { courses, type, ...other } = student;

        return {
            ...other,
            type: type && { id: type.id, name: type.name },
            courses: courses.map(({ course, id }) => ({ id, courseId: course.id, name: course.name })),
        };
    };
}
