import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from '../../base/entity';
import { CourseEntity } from './course.entity';

/**
 * 这两张表应该在order模块中
 */
@Entity()
export class SalesEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    batches: number;

    @Column()
    price: number;

    @Column()
    earnings: number;

    @Column()
    paidAmount: number;

    @Column()
    studentAmount: number;

    @ManyToOne(() => CourseEntity, (course) => course.sales)
    course: CourseEntity;

    @OneToMany(() => OrderEntity, (order) => order.course)
    orders: OrderEntity[];
}

export enum OrderStatus {
    pending,
    success,
}

@Entity()
export class OrderEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: OrderStatus })
    status: OrderStatus;

    @ManyToOne(() => SalesEntity, (sales) => sales.orders)
    course: SalesEntity;

    @Column()
    price: number;

    @Column()
    amount: number;

    @Column()
    allowance: number;
}
