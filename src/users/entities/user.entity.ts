import { IsEmail, IsEnum } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../role/role.enum';

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    password: string;

    @Column()
    @IsEnum(Role)
    role: string;

    @Column()
    key: string;

    @Column()
    iv: string;
}
