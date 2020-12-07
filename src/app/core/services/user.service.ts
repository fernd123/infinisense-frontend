import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { BASEURL_DEV_USER } from 'src/app/shared/constants/app.constants';
import { User } from 'src/app/shared/models/user.model';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    urlEndPoint: string = BASEURL_DEV_USER;


    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    getData(url: string) {
        let headers = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(url, headers);
    }

    getUserByDni(dni: string) {
        //let headers : any = { headers: this.authService.getHeadersJsonTenancyDefault() };
        let params = new HttpParams().set('dni', dni);
        const loginURL = this.urlEndPoint + "/search/findByDniInternal";
        return this.http.get(loginURL, { params: params, headers : this.authService.getHeadersJsonTenancyDefault() });
    }

    getUserSignature(userUrl: any) {
        let headers = this.authService.getHeadersTenancyDefault();
        const loginURL = userUrl + "/signature";
        return this.http.get(loginURL, { headers, responseType: 'blob' }).pipe(mergeMap((res: Blob) => this.createImageFromBlob(res)));
    }

    getExternalUsers() {
        let headers = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/search/findByExternalUsers", headers);
    }

    getInternalUsers() {
        let headers = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/search/findByInternalUsers", headers);
    }

    getUserByUuid(uuid: string) {
        let headers = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + uuid, headers);
    }

    saveUser(userUrl: string, user: User) {
        // Save petition options into a variable
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        // Execute the request
        if (userUrl == null) {
            return this.http.post(this.urlEndPoint, user, options);
        } else {
            return this.http.put(userUrl, user, options);
        }
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