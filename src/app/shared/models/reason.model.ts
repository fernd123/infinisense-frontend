import { IReason } from '../interfaces/iReason.interface';
import { BaseModel } from './base.model';
import { PlantVirtualization } from './plantvirtualization.model';

export class Reason extends BaseModel implements IReason {
    uuid: string;
    name: string;
    description: string;
    active: boolean;
    plantZone?: any;
}