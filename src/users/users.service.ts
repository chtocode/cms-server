import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { groupBy, omitBy } from 'lodash';
import { Connection, EntityManager, Repository, Transaction, TransactionManager } from 'typeorm';
import { CourseTypeEntity } from '../course/entities/course-type.entity';
import { Role } from '../role/role.enum';
import { StudentProfileDto } from '../students/dto/student-profile.dto';
import { StudentProfileEntity } from '../students/entities/student-profile.entity';
import { StudentProfile } from '../students/model/students.model';
import { TeacherProfileDto } from '../teachers/dto/teacher-profile.dto';
import { encryptPwd } from '../utils/crypto';
import { StudentEntity } from './../students/entities/student.entity';
import { TeacherEduEntity, TeacherProfileEntity, WorkExpEntity } from './../teachers/entities/teacher-profile.entity';
import { TeacherEntity } from './../teachers/entities/teacher.entity';
import { Education, TeacherProfile, WorkExperience } from './../teachers/model/teachers.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private connection: Connection,
    ) {}

    async findOne(
        condition: Partial<Pick<UserEntity, 'id' | 'email'>>,
        relations?: string[],
    ): Promise<UserEntity | undefined> {
        return this.userRepo.findOne(condition, { relations });
    }

    async create({ email, role, password }: CreateUserDto): Promise<Partial<UserEntity>> {
        const salt = Math.random().toString(32).slice(2);
        const { result, key, iv } = encryptPwd(password, salt);
        const user = await this.userRepo.save({ email, role, password: result, key, iv });

        return { email: user.email, role: user.role };
    }

    async findProfile(userId: number): Promise<StudentProfile | TeacherProfile> {
        const user = await this.userRepo.findOne(userId);
        const role = user.role;

        if (role === Role.Student) {
            return this.getStudentProfile(user);
        }

        if (role === Role.Teacher) {
            return this.getTeacherProfile(user);
        }

        throw new NotFoundException(`Can not found profile by userId: ${userId}`);
    }

    async getTeacherProfile(user: UserEntity): Promise<TeacherProfile> {
        const { profile } = await this.connection
            .getRepository(TeacherEntity)
            .createQueryBuilder('teacher')
            .leftJoinAndSelect('teacher.profile', 'profile')
            .leftJoinAndSelect('profile.workExperience', 'workExperience', 'workExperience.deletedAt IS NULL')
            .leftJoinAndSelect('profile.education', 'education', 'education.deletedAt IS NULL')
            .where(`teacher.email = :email`)
            .setParameters({
                email: user.email,
            })
            .getOne();
        const { workExperience, education, ...others } = profile;

        return {
            ...others,
            workExperience: workExperience.map((exp) => ({ ...exp, startEnd: exp.startAt + ' ' + exp.endAt })),
            education: education.map((edu) => ({ ...edu, startEnd: edu.startAt + ' ' + edu.endAt })),
        };
    }

    @Transaction()
    async updateTeacherProfile(
        teacherProfileDto: TeacherProfileDto,
        @TransactionManager() manager?: EntityManager,
    ): Promise<TeacherProfile> {
        const teacherProfileRepo = manager.getRepository(TeacherProfileEntity);
        const workExpRepo = manager.getRepository(WorkExpEntity);
        const eduRepo = manager.getRepository(TeacherEduEntity);
        const { id, workExperience, education, ...others } = teacherProfileDto;
        const selector = teacherProfileRepo
            .createQueryBuilder('profile')
            .leftJoinAndSelect('profile.workExperience', 'work', 'work.deletedAt IS NULL')
            .leftJoinAndSelect('profile.education', 'edu', 'edu.deletedAt IS NULL')
            .where(`profile.id = ${id}`);

        const { workExperience: work, education: edu, ...profile } = await selector.getOne();

        await this.updateList(workExpRepo, workExperience, profile, work);
        await this.updateList(eduRepo, education, profile, edu);
        await teacherProfileRepo.update(
            id,
            omitBy(others, (item) => !item),
        );

        const { workExperience: updatedWork, education: updatedEdu, ...rest } = await selector.getOne();
        const iterator = ({ startAt, endAt, teacherProfile, ...other }) => ({
            ...other,
            startEnd: startAt + ' ' + endAt,
        });

        return {
            ...rest,
            workExperience: updatedWork.map(iterator) as WorkExperience[],
            education: updatedEdu.map(iterator) as Education[],
        };
    }

    async getStudentProfile(user: UserEntity): Promise<StudentProfile> {
        const { profile } = await this.connection
            .getRepository(StudentEntity)
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.profile', 'profile')
            .leftJoinAndSelect('profile.interest', 'interest')
            .where(`student.email = :email`)
            .setParameters({
                email: user.email,
            })
            .getOne();
        const { interest, ...others } = profile;

        return { ...others, interest: interest.map((item) => item.name) };
    }

    @Transaction()
    async updateStudentProfile(
        updateStudentDto: StudentProfileDto,
        @TransactionManager() manager?: EntityManager,
    ): Promise<StudentProfile> {
        const { interest, id, ...others } = updateStudentDto;
        const profileRepo = manager.getRepository(StudentProfileEntity);

        await profileRepo.update(id, others);

        if (interest) {
            const courseTypeRepo = manager.getRepository(CourseTypeEntity);
            const exist = await manager
                .getRepository(CourseTypeEntity)
                .find({ where: interest.map((name) => ({ name })) });
            const toCreate = interest
                .filter((name) => !exist.find((item) => item.name === name))
                .map((name) => courseTypeRepo.create({ name }));
            const interestToUpdate = [...exist, ...toCreate];

            await profileRepo.save({ id, interest: interestToUpdate });
        }

        const { interest: updatedInterest, ...rest } = await profileRepo.findOne(id, { relations: ['interest'] });

        return { ...rest, interest: updatedInterest.map((item) => item.name) };
    }

    private async updateList(repo: Repository<any>, dto: any[], profile: any, source: any[]): Promise<void> {
        if (!dto || !dto.length) {
            return;
        }

        const { toUpdate, toCreate } = groupBy(dto, (item) => (!!item.id ? 'toUpdate' : 'toCreate'));
        const dateTransform = (str: string) => {
            const reg = /\d{4}([-/]\d{1,2}){2}/g;
            const result = str.match(reg);

            return { startAt: result[0], endAt: result[1] };
        };

        if (toUpdate && toUpdate.length) {
            await repo.save(toUpdate.map(({ startEnd, ...rest }) => ({ ...rest, ...dateTransform(startEnd) })));
        }

        const toDelete = source.filter((item) => !dto.find((ele) => ele.id === item.id));

        if (toDelete && toDelete.length) {
            await repo.softDelete(toDelete.map((item) => item.id));
        }

        if (toCreate && toCreate.length) {
            await repo.save(
                toCreate.map(({ startEnd, ...rest }) =>
                    repo.create({ ...rest, ...dateTransform(startEnd), teacherProfile: profile }),
                ),
            );
        }
    }
}
