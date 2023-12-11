import { Injectable } from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';

@Injectable()
export class MetricDTO {
  @IsString()
  conf: string;

  @IsString()
  uid: string;

  @IsArray()
  m: any[];
}
