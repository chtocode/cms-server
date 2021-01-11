import {
    Column,

    Entity,

    ManyToOne,


    PrimaryGeneratedColumn
} from 'typeorm';
import { EntityWithTimeStamp, transformer } from '../../base/entity';
import { CourseEntity } from './../../course/entities/course.entity';
import { StudentEntity } from './student.entity';

@Entity()
export class StudentCourseEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp', transformer, nullable: true })
    courseDate: Date;

    @ManyToOne(() => StudentEntity, (student) => student.courses, { cascade: true })
    student: StudentEntity;

    @ManyToOne(() => CourseEntity)
    course: CourseEntity;
}
