import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CourseTypeEntity } from './../course/entities/course-type.entity';
import { CreateTeacherDto, SkillDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherEduEntity, TeacherProfileEntity } from './entities/teacher-profile.entity';
import { TeacherSkillEntity } from './entities/teacher-skill.entity';
import { TeacherEntity } from './entities/teacher.entity';
import { Teacher, TeachersResponse } from './model/teachers.model';

@Injectable()
export class TeachersService {
    constructor(
        @InjectRepository(TeacherEntity) private teacherRepo: Repository<TeacherEntity>,
        @InjectRepository(TeacherProfileEntity) private teacherProfileRepo: Repository<TeacherProfileEntity>,
        @InjectRepository(TeacherEduEntity) private teacherEduRepo: Repository<TeacherEduEntity>,
        @InjectRepository(TeacherSkillEntity) private teacherSkillRepo: Repository<TeacherSkillEntity>,
        private usersService: UsersService,
        private connection: Connection,
    ) {}

    /**
     * ```json
     * {
            "name": "zhang3",
            "country": "china",
            "phone": "111111",
            "skills": [
                {
                    "name": "java",
                    "level": 4
                },
                {
                    "name": "c#",
                    "level": 5
                }
            ],
            "email": "111@a.com"
        }
     * ```
     */
    async create(createTeacherDto: CreateTeacherDto, manager: EntityManager): Promise<Teacher> {
        const { name, email, country, phone } = createTeacherDto;
        const profile = this.teacherProfileRepo.create({});
        const skills = await this.getSkills(createTeacherDto.skills, manager);
        const { profile: _1, deletedAt: _2, ...others } = await this.teacherRepo.save({
            skills,
            name,
            email,
            country,
            phone,
            profile,
        });

        return this.transformTeacherEntityToResponse({ ...(others as TeacherEntity) });
    }

    async findAll(page: number, limit: number, query = ''): Promise<TeachersResponse> {
        const total = await this.teacherRepo
            .createQueryBuilder('teacher')
            .where('teacher.name LIKE :param')
            .setParameters({
                param: '%' + query + '%',
            })
            .getCount();
        const selector = this.teacherRepo
            .createQueryBuilder('teacher')
            .leftJoinAndSelect('teacher.courses', 'courses')
            .leftJoinAndSelect('teacher.skills', 'skills')
            .leftJoinAndSelect('skills.courseType', 'courseType')
            .where('teacher.name LIKE :param')
            .setParameters({
                param: '%' + query + '%',
            })
            .orderBy('teacher.id');

        const result =
            page && limit
                ? await selector
                      .skip((page - 1) * limit)
                      .take(limit)
                      .getMany()
                : await selector.getMany();
        const teachers: Teacher[] = result.map(this.transformTeacherEntityToResponse);

        return { total, teachers, paginator: { page, limit } };
    }

    async findOne(id: number): Promise<Teacher> {
        const teacher = await this.teacherRepo.findOne(id, {
            relations: ['courses', 'skills', 'skills.courseType', 'profile'],
        });

        return teacher ? this.transformTeacherEntityToResponse(teacher) : null;
    }

    async update(updateTeacherDto: UpdateTeacherDto, manager: EntityManager): Promise<Teacher> {
        const { id, name, email, country, phone } = updateTeacherDto;
        let skills = null;

        if (updateTeacherDto.skills) {
            skills = await this.getSkills(updateTeacherDto.skills, manager);
        }

        const updateValues = skills?.length ? { skills, name, email, country, phone } : { name, email, country, phone };
        const teacher = await this.teacherRepo.findOne(id);

        await this.teacherRepo.save({ ...teacher, ...updateValues });

        return this.findOne(id);
    }

    async remove(id: number): Promise<boolean> {
        const { raw } = await this.teacherRepo.softDelete({ id });

        return raw.affectedRows >= 1;
    }

    private transformTeacherEntityToResponse = (teacher: Omit<TeacherEntity, 'setComputed'>): Teacher => {
        const { skills, courses, ...other } = teacher;

        return {
            ...other,
            skills: skills.map((item) => ({ name: item.courseType.name, level: item.level })),
        };
    };

    private async getSkills(skills: SkillDto[], manager: EntityManager): Promise<TeacherSkillEntity[]> {
        const skillNames = skills.map((skill) => skill.name);
        const exist = await manager
            .getRepository(CourseTypeEntity)
            .find({ where: skillNames.map((name) => ({ name })) });
        const toCreate = skills.filter((skill) => !exist.find((item) => item.name === skill.name));
        const courseTypeRepo = manager.getRepository(CourseTypeEntity);
        const teacherSkillRepo = manager.getRepository(TeacherSkillEntity);
        let skillsExist: TeacherSkillEntity[] = [];
        let skillsFresh: TeacherSkillEntity[] = [];

        if (exist && exist.length) {
            skillsExist = skills.map((skill) => {
                const courseType = exist.find(({ name }) => name === skill.name);

                return teacherSkillRepo.create({ level: skill.level, courseType });
            });
        }

        if (toCreate && toCreate.length) {
            const toCreateCourseTypeEntities = toCreate.map((type) => courseTypeRepo.create({ name: type.name }));

            skillsFresh = skills.map((skill) => {
                const courseType = toCreateCourseTypeEntities.find(({ name }) => name === skill.name);

                return teacherSkillRepo.create({ level: skill.level, courseType });
            });
        }

        return [...skillsExist, ...skillsFresh];
    }
}
