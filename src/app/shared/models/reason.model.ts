import { IReason } from '../interfaces/iReason.interface';
import { BaseModel } from './base.model';

export class Reason extends BaseModel implements IReason {
    uuid: string;
    name: string;
    description: string;
    active: boolean;
}