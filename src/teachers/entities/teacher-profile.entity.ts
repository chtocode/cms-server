import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '../../shared/constant/gender';
import { EntityWithDateRange, EntityWithTimeStamp, transformer } from './../../base/entity';
import { TeacherEntity } from './teacher.entity';

@Entity()
export class TeacherProfileEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    // @ManyToOne(() => CourseTypeEntity, courseType => courseType.skills)
    // courseType: CourseTypeEntity

    /**
     * string split with comma; e.g 'province, city, xian';
     */
    @Column({
        nullable: true,
        type: 'simple-array',
    })
    address: string[];

    @Column({
        type: 'enum',
        enum: Gender,
        nullable: true,
    })
    gender: number;

    @Column({ type: 'date', transformer: transformer, nullable: true })
    birthday: Date;

    @Column({
        nullable: true,
    })
    avatar: string;

    @Column({
        nullable: true,
        type: 'text'
    })
    description: string;

    @OneToMany(() => WorkExpEntity, (exp) => exp.teacherProfile)
    workExperience: WorkExpEntity[];

    @OneToMany(() => TeacherEduEntity, (edu) => edu.teacherProfile)
    education: TeacherEduEntity[];

    @OneToOne(() => TeacherEntity, teacher => teacher.profile)
    teacher: TeacherEntity;
}

@Entity()
export class WorkExpEntity extends EntityWithDateRange {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    company: string;

    @Column()
    post: string;

    @ManyToOne(() => TeacherProfileEntity, (profile) => profile.workExperience, { cascade: true })
    teacherProfile: TeacherProfileEntity;
}

@Entity()
export class TeacherEduEntity extends EntityWithDateRange {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    level: number;

    @Column()
    degree: string;

    @ManyToOne(() => TeacherProfileEntity, (profile) => profile.workExperience)
    teacherProfile: TeacherProfileEntity;
}
