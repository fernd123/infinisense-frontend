import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASEURL_DEV_PLANT } from 'src/app/shared/constants/app.constants';
import { Plant } from 'src/app/shared/models/plant.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlantService {


    urlEndPoint: string = BASEURL_DEV_PLANT;

    constructor(private http: HttpClient, private router: Router) { }

    getPlants(tenantId: string) {
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
        return this.http.get(this.urlEndPoint, options);
    }

    getPlant(plantId: string, tenantId: string){
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
        return this.http.get(this.urlEndPoint+"/"+plantId, options);
    }

    getPlantPlaneByPlant(plantId: string, tenantId: string){
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
        return this.http.get(this.urlEndPoint+`/${plantId}/planes`);
    }

    getPlantPlanes(filename: string, tenantId: string) {
        let headers = new HttpHeaders({
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('filename', filename);
        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        return this.http.get(this.urlEndPoint+`/planes/download/${filename}`, { responseType: "blob" });
    }

    savePlant(plant: Plant, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('name', plant.name);
        body.set('location', plant.location);
        body.set('phone', plant.phone);
        body.set('alternativePhone', plant.alternativePhone);
        body.set('maximumCapacity', plant.maximumCapacity);

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        if (plant.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + plant.uuid, body.toString(), options);
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

    getFiles(): Observable<any> {
        return this.http.get(`${this.urlEndPoint}/files`);
    }


}