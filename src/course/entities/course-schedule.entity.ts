import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from '../../base/entity';
import { CourseStatus } from '../constant/course';
import { CourseChapterEntity } from './course-chapter.entity';

@Entity()
export class CourseScheduleEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * !FIXME: repeat with status column in CourseEntity
     */
    @Column({
        type: 'enum',
        enum: CourseStatus,
    })
    status: number;

    @Column()
    current: number; // ?某个chapterId

    /**
     * split with comma; e.g."Monday 14:00:00", "Friday 16:15:00"
     */
    @Column()
    classTime: string;

    @OneToMany(() => CourseChapterEntity, (chapter) => chapter.schedule)
    chapters: CourseChapterEntity;
}
