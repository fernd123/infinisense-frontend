import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BASEURL_DEV_PLANT, BASEURL_DEV_PLANTCOORDINATES } from 'src/app/shared/constants/app.constants';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class PlantCoordsService {

    urlEndPoint: string = BASEURL_DEV_PLANT;
    plantCoordinatesBaseUrl: string = BASEURL_DEV_PLANTCOORDINATES;
    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    getData(uri: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(uri, options);
    }

    getPlant(plantId: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + plantId, options);
    }

    getPlantPlaneByPlant(plantCoordsUrl: string, type: string = null) {
        let body = new URLSearchParams();
        let options = { headers: this.authService.getHeadersJsonTenancyDefault()/*, params: { type: type }*/ };
        return this.http.get(`${plantCoordsUrl}`, options);
    }

    getPlantCoordinateByUuid(plantUrl: string, uuid: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(plantUrl + "/plantCoordinate/" + uuid, options);
    }

    getPlantCoordinates(plantUrl: string, uuid: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(plantUrl + "/plantCoordinate", options);
    }

    savePlantVirtual(plantCoordinateUrl: string, plantVirtual: PlantCoordinates) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        if (plantCoordinateUrl == null) {
            return this.http.post(this.plantCoordinatesBaseUrl, plantVirtual, options);
        } else {
            return this.http.put(plantCoordinateUrl, plantVirtual, options);
        }
    }

    associateRelation(plantUrl: string, coordinateUrl: string) {
        let data = plantUrl;
        const options = {
            headers: {
                'Content-Type': 'text/uri-list',
                'X-TenantID': this.authService.getTenantId(),
            },
            'observe': "response" as 'response', // to display the full response & as 'body' for type cast
        };
        return this.http.put(coordinateUrl, data, options);
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

    deleteVirtualZone(plantCoordinateUrl: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(plantCoordinateUrl, options);
    }
}