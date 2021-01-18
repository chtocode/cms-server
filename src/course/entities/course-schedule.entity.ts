import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from '../../base/entity';
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
        enum: [0, 1, 2],
        default: 0,
    })
    status: number;

    @Column({
        nullable: true,
    })
    current: number; // ?某个chapterId

    /**
     * split with comma; e.g."Monday 14:00:00", "Friday 16:15:00"
     */
    @Column({
        nullable: true,
        type: 'simple-array',
    })
    classTime: string[];

    @OneToMany(() => CourseChapterEntity, (chapter) => chapter.schedule, { cascade: true })
    chapters: CourseChapterEntity[];
}
