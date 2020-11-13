import { IPlantPlane } from '../interfaces/iPlantPlane.interface';
import { BaseModel } from './base.model';

export class PlantPlane extends BaseModel implements IPlantPlane {
    uuid: string;
    name: string;
    path: string;
}