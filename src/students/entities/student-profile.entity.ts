import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp, transformer } from '../../base/entity';
import { CourseTypeEntity } from '../../course/entities/course-type.entity';
import { Gender } from '../../shared/constant/gender';

@Entity()
export class StudentProfileEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column({
        nullable: true,
        type: 'simple-array',
    })
    address: string[];

    @Column({
        nullable: true,
    })
    age: number;

    @Column()
    country: string;

    @Column({
        nullable: true,
    })
    avatar: string;

    @Column({
        nullable: true,
    })
    description: string;

    @Column({
        nullable: true,
    })
    education: string;

    @Column({
        type: 'enum',
        enum: Gender,
        nullable: true,
    })
    gender: number;

    @ManyToMany(() => CourseTypeEntity, { cascade: true })
    @JoinTable()
    interest: CourseTypeEntity[];

    @Column({ type: 'timestamp', transformer, nullable: true })
    memberEndAt: Date;

    @Column({ type: 'timestamp', transformer, nullable: true })
    memberStartAt: Date;

    @Column()
    name: string;

    @Column({
        nullable: true,
    })
    phone: string;
}
