import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MetricDocument = HydratedDocument<Metric>;

@Schema({ collection: process.env.MONGO_COLLECTION_NAME })
export class Metric {
  @Prop()
  conf: string;

  @Prop()
  uid: string;

  @Prop([])
  m: any[];
}

export const MetricSchema = SchemaFactory.createForClass(Metric);
