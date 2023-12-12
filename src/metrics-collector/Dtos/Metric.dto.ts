import { Injectable } from '@nestjs/common';
import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

@Injectable()
export class MetricDTO {
  @IsString()
  //@Matches('/ede/')
  conf: string;

  @IsUUID()
  @IsOptional()
  uid: string;

  @IsObject()
  m: {
    u: U;
    d: D;
    t: T;
  };
}

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

class T {
  // transport ip
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
  @IsIn([])
  sr: string;
}
