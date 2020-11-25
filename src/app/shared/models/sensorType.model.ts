import { IReason } from '../interfaces/iReason.interface';
import { ISensorType } from '../interfaces/iSensorType.interface';
import { BaseModel } from './base.model';

export class SensorType extends BaseModel implements ISensorType {
    uuid: string;
    name: string;
    description: string;
    active: boolean;
    image ?: string;
    imgbuffer: any;
}