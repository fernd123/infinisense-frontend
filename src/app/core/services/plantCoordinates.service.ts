import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASEURL_DEV_PLANT } from 'src/app/shared/constants/app.constants';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';

@Injectable({ providedIn: 'root' })
export class PlantCoordsService {

    urlEndPoint: string = BASEURL_DEV_PLANT;

    constructor(private http: HttpClient, private router: Router) { }

    getPlant(plantId: string, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        return this.http.get(this.urlEndPoint + "/" + plantId, options);
    }

    getPlantPlaneByPlant(plantId: string, type: string = null, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('type', type);
        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        return this.http.get(this.urlEndPoint + `/${plantId}/coordinates`, {
            params: {
                type: type
            }
        });
    }

    getPlantCoordinateByUuid(plantId: string, uuid: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let options = { headers: headers };
        return this.http.get(this.urlEndPoint + "/" + plantId + "/coordinates/" + uuid, options);
    }

    getPlantCoordinates(plantId: string, uuid: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let options = { headers: headers };
        return this.http.get(this.urlEndPoint + "/" + plantId + "/coordinates", options);
    }

    savePlantVirtual(plantVirtual: PlantCoordinates, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('name', plantVirtual.name);
        body.set('virtualZoneType', plantVirtual.virtualZoneType);
        body.set('sensorType', plantVirtual.sensorType);
        body.set('sensorId', plantVirtual.sensorId);
        body.set('status', plantVirtual.status);
        body.set('coordinates', plantVirtual.coordinates);
        body.set('epis', plantVirtual.epis);

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        if (plantVirtual.uuid == null) {
            return this.http.post(this.urlEndPoint + "/" + plantVirtual.plantid + "/coordinates", body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + plantVirtual.plantid + "/coordinates/" + plantVirtual.uuid, body.toString(), options);
        }
    }

    upload(file: File, uuid: string): any {
        const formData: FormData = new FormData();
        formData.append('file', file);

        const req = new HttpRequest('POST', `${this.urlEndPoint}/${uuid}/upload`, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }

    deleteVirtualZone(plantId: string, uuid: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let options = { headers: headers };
        return this.http.delete(this.urlEndPoint + "/" + plantId + "/coordinates/" + uuid, options);
    }
}