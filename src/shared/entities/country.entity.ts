import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CountriesEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    cn: string;

    @Column()
    en: string;

    @Column()
    phone_code: string;
}
