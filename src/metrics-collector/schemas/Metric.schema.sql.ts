import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MetricR {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conf: string;

  @Column()
  uid: string;

  @Column()
  m: any[];
}
