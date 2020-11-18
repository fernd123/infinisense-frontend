import { IPlant } from '../interfaces/iPlant.interface';
import { IPlantVirtualization } from '../interfaces/iPlantVirtualization.interface';
import { IUser } from '../interfaces/iUser.interface';
import { BaseModel } from './base.model';
import { PlantPlane } from './plantPlane.model';
import { Plant } from './plant.model';

export class PlantVirtualization extends BaseModel implements IPlantVirtualization {
    uuid: string;
    name: string;
    plantid: string;
    coordinates: any;
    virtualZoneType: string;
    sensorType: string;
    sensorId: string;
    plant?: Plant;
}