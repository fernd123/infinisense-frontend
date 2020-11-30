import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BASEURL_DEV_PLANT } from 'src/app/shared/constants/app.constants';
import { Plant } from 'src/app/shared/models/plant.model';
import { mergeMap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class PlantService {

    urlEndPoint: string = BASEURL_DEV_PLANT;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    getPlants() {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getPlantByUuid(plantId: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + plantId, options);
    }

    getPlantPlaneByPlant(plantId: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + `/${plantId}/planes`, options);
    }

    getPlantPlanes(filename: string) {
        let body = new URLSearchParams();
        body.set('filename', filename);
        let headers = this.authService.getHeadersTenancyDefault();
        // TODO REVISAR
        return this.http.get(this.urlEndPoint + `/planes/download/${filename}`, { headers, responseType: 'blob' }).pipe(mergeMap(res => this.createImageFromBlob(res)));
    }

    savePlant(plant: Plant) {
        let body = new URLSearchParams();
        body.set('name', plant.name);
        body.set('location', plant.location);
        body.set('phone', plant.phone);
        body.set('alternativePhone', plant.alternativePhone);
        body.set('maximumCapacity', plant.maximumCapacity);

        let options = { headers: this.authService.getHeadersTenancyDefault() };
        if (plant.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + plant.uuid, body.toString(), options);
        }
    }

    deletePlant(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(this.urlEndPoint + "/" + uuid, options);
    }

    upload(file: File, plantUuid: string, uuid: string): any {
        const formData: FormData = new FormData();
        formData.append('file', file);
        let type = 'PUT';
        let url = `${this.urlEndPoint}/${plantUuid}/upload/${uuid}`;
        if (uuid == undefined) {
            type = 'POST';
            url = `${this.urlEndPoint}/${plantUuid}/upload`;
        }
        let headers = new HttpHeaders({
            'X-TenantID': this.authService.getTenantId(),
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let options = { headers: headers };
        const req = new HttpRequest(type, url, formData, options/*{
            reportProgress: true,
            responseType: 'json'
        }*/);

        return this.http.request(req);
    }

    getFiles(): Observable<any> {
        return this.http.get(`${this.urlEndPoint}/files`);
    }


    createImageFromBlob(image: Blob): Observable<string | ArrayBuffer> {
        const imageObservable = new Observable<string | ArrayBuffer>(observer => {
            if (image) {
                let reader = new FileReader();
                reader.addEventListener("load", () => {
                    observer.next(reader.result);
                    observer.complete();
                }, false);
                reader.readAsDataURL(image);
            } else {
                console.log(image);
                observer.next(null)
                observer.complete();
            }
        });
        return imageObservable;
    }

}