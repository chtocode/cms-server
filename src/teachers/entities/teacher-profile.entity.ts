import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '../../shared/constant/gender';
import { EntityWithDateRange, EntityWithTimeStamp, transformer } from './../../base/entity';

@Entity()
export class TeacherProfileEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    // @ManyToOne(() => CourseTypeEntity, courseType => courseType.skills)
    // courseType: CourseTypeEntity

    /**
     * string split with comma; e.g 'province, city, xian';
     */
    @Column()
    address: string;

    @Column({
        type: 'enum',
        enum: Gender,
    })
    gender: number;

    @Column({ type: 'date', transformer: transformer })
    birthday: Date;

    @Column()
    avatar: string;

    @Column()
    description: string;

    @OneToMany(() => WorkExpEntity, (exp) => exp.teacherProfile)
    workExperience: WorkExpEntity[];

    @OneToMany(() => TeacherEduEntity, (edu) => edu.teacherProfile)
    education: TeacherEduEntity[];
}

@Entity()
export class WorkExpEntity extends EntityWithDateRange {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    company: string;

    @Column()
    post: string;

    @ManyToOne(() => TeacherProfileEntity, (profile) => profile.workExperience)
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
