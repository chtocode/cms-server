import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DegreeEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    short: string;

    @Column()
    name: string;

    @Column()
    group: string;
}
