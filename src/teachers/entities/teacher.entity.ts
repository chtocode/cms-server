import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EntityWithTimeStamp } from "../../base/entity";
import { CourseEntity } from "../../course/entities/course.entity";
import { TeacherProfileEntity } from "./teacher-profile.entity";
import { TeacherSkillEntity } from "./teacher-skill.entity";
@Entity()
export class TeacherEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    country: string;

    /**
     * calculate column;
     */
    // @Column()
    // courseAmount: number;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column()
    phone: string;

    @OneToOne(() => TeacherProfileEntity)
    @JoinColumn()
    profile:TeacherProfileEntity;
    
    @OneToMany(() => TeacherSkillEntity, (skill) => skill.teacher)
    skills: TeacherSkillEntity[];

    @OneToMany(() => CourseEntity, (course) => course.teacher)
    courses: CourseEntity[];
}
