import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityWithTimeStamp, transformer } from '../../base/entity';
import { TeacherEntity } from '../../teachers/entities/teacher.entity';
import { DurationUnit } from './../model/course.model';
import { CourseScheduleEntity } from './course-schedule.entity';
import { CourseTypeEntity } from './course-type.entity';
import { SalesEntity } from './sales.entity';

export type CourseStatus = 0 | 1 | 2;

@Entity()
export class CourseEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: 'http://lorempixel.com/800/600/technics/',
    })
    cover: string;

    @Column()
    detail: string;

    @Column()
    duration: number;

    @Column({
        type: 'enum',
        enum: [1, 2, 3, 4, 5],
    })
    durationUnit: DurationUnit;

    @Column()
    maxStudents: number;

    @Column()
    name: string;

    @Column()
    price: number;

    @Column()
    uid: string;

    @Column({
        default: 0,
    })
    star: number;

    @Column({ type: 'date', transformer: transformer })
    startTime: Date;

    @Column({
        type: 'enum',
        enum: [0, 1, 2],
    })
    status: CourseStatus;

    @OneToMany(() => SalesEntity, (sales) => sales.course)
    sales: SalesEntity[];

    // add column explicitly here
    @Column({ name: 'scheduleId' })
    scheduleId: number;

    @OneToOne(() => CourseScheduleEntity, { cascade: true })
    @JoinColumn({ name: 'scheduleId' })
    schedule: CourseScheduleEntity;

    @Column({ name: 'teacherId' })
    teacherId: number;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.courses, { cascade: true })
    @JoinColumn({ name: 'teacherId' })
    teacher: TeacherEntity;

    @ManyToMany(() => CourseTypeEntity, { cascade: true })
    @JoinTable()
    type: CourseTypeEntity[];
}
