import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from '../../base/entity';

@Entity()
export class StudentTypeEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
