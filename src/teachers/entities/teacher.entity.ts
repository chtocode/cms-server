import { AfterLoad, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from '../../base/entity';
import { CourseEntity } from '../../course/entities/course.entity';
import { TeacherProfileEntity } from './teacher-profile.entity';
import { TeacherSkillEntity } from './teacher-skill.entity';
@Entity()
export class TeacherEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    country: string;

    /**
     * calculate column;
     */
    @Column({
        default: 0,
    })
    courseAmount: number;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column()
    phone: string;

    @Column({
        name: 'profileId',
    })
    profileId: number;

    @OneToOne(() => TeacherProfileEntity, { cascade: true })
    @JoinColumn({
        name: 'profileId',
    })
    profile: TeacherProfileEntity;

    @OneToMany(() => TeacherSkillEntity, (skill) => skill.teacher, { cascade: true })
    skills: TeacherSkillEntity[];

    @OneToMany(() => CourseEntity, (course) => course.teacher)
    courses: CourseEntity[];

    @AfterLoad()
    setComputed() {
        this.courseAmount = this.courses?.length || 0;
    }
}
