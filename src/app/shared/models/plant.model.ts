import { IPlant } from '../interfaces/iPlant.interface';
import { IUser } from '../interfaces/iUser.interface';
import { BaseModel } from './base.model';
import { PlantPlane } from './plantPlane.model';

export class Plant extends BaseModel implements IPlant {
    uuid: string;
    name: string;
    location: string;
    phone: string;
    alternativePhone: string;
    maximumCapacity: string;
    plantPlane: PlantPlane[];
}