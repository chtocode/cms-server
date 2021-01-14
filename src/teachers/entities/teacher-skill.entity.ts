import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CourseTypeEntity } from '../../course/entities/course-type.entity';
import { TeacherEntity } from './teacher.entity';

@Entity()
export class TeacherSkillEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    level: number;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.skills)
    teacher: TeacherEntity;

    @ManyToOne(() => CourseTypeEntity, { cascade: true })
    courseType: CourseTypeEntity;
}
