import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { EntityWithTimeStamp, transformer } from '../../base/entity';
import { TeacherEntity } from '../../teachers/entities/teacher.entity';
import { CourseStatus } from '../constant/course';
import { CourseScheduleEntity } from './course-schedule.entity';
import { CourseTypeEntity } from './course-type.entity';
import { SalesEntity } from './sales.entity';

@Entity()
export class CourseEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cover: string;

    @Column()
    detail: string;

    @Column()
    duration: number;

    @Column()
    durationUnit: number;

    @Column()
    maxStudents: number;

    @Column()
    name: string;

    @Column()
    price: number;

    @Column()
    uid: string;

    @Column()
    star: number;

    @Column({ type: 'date', transformer: transformer })
    startTime: Date;

    @Column({
        type: 'enum',
        enum: CourseStatus,
    })
    status: number;

    @OneToMany(() => SalesEntity, (sales) => sales.course )
    sales: SalesEntity[];

    @OneToOne(() => CourseScheduleEntity)
    @JoinColumn()
    schedule: CourseScheduleEntity;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.courses)
    teacher: TeacherEntity;

    @ManyToMany(() => CourseTypeEntity)
    @JoinColumn()
    type: CourseTypeEntity[];
}
