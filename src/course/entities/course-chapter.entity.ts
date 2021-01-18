import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from './../../base/entity';
import { CourseScheduleEntity } from './course-schedule.entity';

@Entity()
export class CourseChapterEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    order: number;

    @Column()
    content: string;

    @ManyToOne(() => CourseScheduleEntity, (schedule) => schedule.chapters)
    schedule: CourseScheduleEntity;
}
