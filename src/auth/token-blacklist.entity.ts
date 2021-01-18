import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TokenBlacklistEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;
}
