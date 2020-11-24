import { SensorType } from '../models/sensorType.model';

export interface IPlantVirtualization {
    uuid: string;
    name: string;
    plantid: string;
    coordinates: any;
    virtualZoneType: string;
    sensorType: SensorType;
    sensorId: string;
}