import { IPlantVirtualization } from '../interfaces/iPlantVirtualization.interface';
import { BaseModel } from './base.model';
import { Plant } from './plant.model';
import { SensorType } from './sensorType.model';

export class PlantCoordinates extends BaseModel implements IPlantVirtualization {
    uuid: string;
    name: string;
    plantid: string;
    coordinates: any;
    virtualZoneType: string;
    sensorType: any;
    sensorId: string;
    status: string;
    plant?: Plant;
    epis: string;
    initCoordinate?: any;
    endCoordinate?: any;
}