import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CourseScheduleEntity } from "./course-schedule.entity";

@Entity()
export class CourseChapterEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    content: string;

    @ManyToOne(() => CourseScheduleEntity, (schedule) => schedule.chapters)
    schedule: CourseScheduleEntity;
}
