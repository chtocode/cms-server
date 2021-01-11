import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StudentProfileEntity } from '../../students/entities/student-profile.entity';
import { TeacherSkillEntity } from '../../teachers/entities/teacher-skill.entity';

@Entity()
export class CourseTypeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => StudentProfileEntity)
    students: StudentProfileEntity[];

    @OneToMany(() => TeacherSkillEntity, skill => skill.courseTypes)
    skills: TeacherSkillEntity[]
}
