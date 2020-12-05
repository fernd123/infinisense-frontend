import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASEURL_DEV_PLANT } from 'src/app/shared/constants/app.constants';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class PlantCoordsService {

    urlEndPoint: string = BASEURL_DEV_PLANT;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    getPlant(plantId: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + plantId, options);
    }

    getPlantPlaneByPlant(plantCoordsUrl: string, type: string = null) {
        let body = new URLSearchParams();
        body.set('type', type);
        //TODO revisar
        let options = { headers: this.authService.getHeadersJsonTenancyDefault()/*, params: { type: type }*/ };
        return this.http.get(`${plantCoordsUrl}`, options);
    }

    getPlantCoordinateByUuid(plantUrl: string, uuid: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(plantUrl + "/coordinates/" + uuid, options);
    }

    getPlantCoordinates(plantUrl: string, uuid: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(plantUrl + "/coordinates", options);
    }

    savePlantVirtual(plantUrl: string, plantVirtual: PlantCoordinates) {
        let body = new URLSearchParams();
        body.set('name', plantVirtual.name);
        body.set('virtualZoneType', plantVirtual.virtualZoneType);
        body.set('sensorType', plantVirtual.sensorType);
        body.set('sensorId', plantVirtual.sensorId);
        body.set('status', plantVirtual.status);
        body.set('coordinates', plantVirtual.coordinates);
        body.set('epis', plantVirtual.epis);

        let options = { headers: this.authService.getHeadersTenancyDefault() };
        if (plantVirtual.uuid == null) {
            return this.http.post(plantUrl + "/coordinates", body.toString(), options);
        } else {
            return this.http.put(plantUrl + "/coordinates/" + plantVirtual.uuid, body.toString(), options);
        }
    }

    upload(file: File, uuid: string): any {
        let formData: FormData = new FormData();
        formData.append('file', file);
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        let req = new HttpRequest('POST', `${this.urlEndPoint}/${uuid}/upload`, formData, options /* {
            reportProgress: true,
            responseType: 'json'
        }*/);
        return this.http.request(req);
    }

    deleteVirtualZone(plantUrl: string, uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(plantUrl + "/coordinates/" + uuid, options);
    }
}