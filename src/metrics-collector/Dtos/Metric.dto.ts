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

class Metric {
  @IsString()
  @IsOptional()
  j_br: string;

  @IsString()
  @IsOptional()
  j_os: string;

  @IsString()
  @IsOptional()
  j_pid: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  j_cq: number;

  @IsOptional()
  j_res_h: number;

  @IsOptional()
  j_res_w: number;

  @IsOptional()
  j_cdc_a: number;

  @IsOptional()
  j_cdc_v: number;

  // upload bandwidth
  @IsNumber()
  @IsOptional()
  j_u_bw: number;
  // upload audio_bitrate
  @IsNumber()
  @IsOptional()
  j_u_ab: number;
  // upload video_bitrate
  @IsNumber()
  @IsOptional()
  j_u_vb: number;
  // upload packet_loss
  @IsNumber()
  @IsOptional()
  j_u_pl: number;

  // upload bandwidth
  @IsNumber()
  @IsOptional()
  j_d_bw: number;
  // upload audio_bitrate
  @IsNumber()
  @IsOptional()
  j_d_ab: number;
  // upload video_bitrate
  @IsNumber()
  @IsOptional()
  j_d_vb: number;
  // upload packet_loss
  @IsNumber()
  @IsOptional()
  j_d_pl: number;

  @IsString()
  @IsOptional()
  j_t_ip: string;
  // transport port
  @IsString()
  @IsOptional()
  j_t_p: string;
  // transport type
  @IsString()
  @IsIn(['tcp', 'udp'])
  @IsOptional()
  j_t_tp: string;
  // transport local_ip
  @IsString()
  @IsOptional()
  j_t_lip: string;
  // transport real_ip
  @IsNumber()
  @IsOptional()
  j_t_rip: number;
  // transport local_port
  @IsString()
  @IsOptional()
  j_t_lp: string;
  // server_region
  @IsString()
  @IsOptional()
  j_t_sr: string;

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
