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
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getPlantByUuid(plantUrl: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(plantUrl, options);
    }

    getPlantPlaneByPlant(plantUrl: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(plantUrl + "/planes", options);
    }

    getPlantPlanes(filename: string) {
        let body = new URLSearchParams();
        body.set('filename', filename);
        let headers = this.authService.getHeadersTenancyDefault();
        // TODO REVISAR
        return this.http.get(this.urlEndPoint + `/planes/download/${filename}`, { headers, responseType: 'blob' }).pipe(mergeMap(res => this.createImageFromBlob(res)));
    }

    savePlant(plantUrl: string, plant: Plant) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        if (plantUrl == null) {
            return this.http.post(this.urlEndPoint, plant, options);
        } else {
            return this.http.put(plantUrl, plant, options);
        }
    }

    deletePlant(plantUrl: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.delete(plantUrl, options);
    }

    upload(file: File, plantUrl: string, uuid: string): any {
        const formData: FormData = new FormData();
        formData.append('file', file);
        let type = 'PUT';
        let url = `${plantUrl}/upload/${uuid}`;
        if (uuid == undefined) {
            type = 'POST';
            url = `${plantUrl}/upload`;
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