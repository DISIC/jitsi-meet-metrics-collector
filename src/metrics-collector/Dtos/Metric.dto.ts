import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class U {
  // upload bandwidth
  @IsNumber()
  @IsOptional()
  bw: number;
  // upload audio_bitrate
  @IsNumber()
  @IsOptional()
  ab: number;
  // upload video_bitrate
  @IsNumber()
  @IsOptional()
  vb: number;
  // upload packet_loss
  @IsNumber()
  @IsOptional()
  pl: number;
}

class D {
  // upload bandwidth
  @IsNumber()
  @IsOptional()
  bw: number;
  // upload audio_bitrate
  @IsNumber()
  @IsOptional()
  ab: number;
  // upload video_bitrate
  @IsNumber()
  @IsOptional()
  vb: number;
  // upload packet_loss
  @IsNumber()
  @IsOptional()
  pl: number;
}

@Injectable()
export class T {
  @IsNumber()
  @IsOptional()
  ip: number;
  // transport port
  @IsNumber()
  @IsOptional()
  p: number;
  // transport type
  @IsString()
  @IsIn(['tcp', 'udp'])
  @IsOptional()
  tp: string;
  // transport local_ip
  @IsNumber()
  @IsOptional()
  lip: number;
  // transport real_ip
  @IsNumber()
  @IsOptional()
  rip: number;
  // transport local_port
  @IsNumber()
  @IsOptional()
  lp: number;
  // server_region
  @IsString()
  @IsOptional()
  sr: string;
}
class Metric {
  @IsString()
  @IsOptional()
  br: string;

  @IsString()
  @IsOptional()
  os: string;

  @IsString()
  pid: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  cq: number;

  @IsOptional()
  res: {};

  @IsOptional()
  cdc: {};

  @ValidateNested()
  @Type(() => U)
  u: U;

  @ValidateNested()
  @Type(() => D)
  d: D;

  @ValidateNested()
  @Type(() => T)
  t: T;

  @IsNumber()
  @IsOptional()
  ts: number;
}
@Injectable()
export class MetricDTO {
  v = process.env.JMMC_AUTHORIZEDREGIONS.split(' ');

  @IsString()
  //@Matches('/ede/')
  conf: string;

  @IsUUID()
  @IsOptional()
  uid: string;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Metric)
  m: Metric;
}
