import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { BASEURL_DEV_USER, BASEURL_DEV_VISIT } from 'src/app/shared/constants/app.constants';
import { AuthenticationService } from './authentication.service';
import { UserService } from './user.service';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisitService {

    urlEndPoint: string = BASEURL_DEV_VISIT;

    constructor(private http: HttpClient,
        private authService: AuthenticationService,
        private userService: UserService) { }

    getData(url) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(url, options);
    }

    saveVisit(user: User) {
        let body = new URLSearchParams();
        body.set('user', JSON.stringify(user));

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        return this.http.post(this.urlEndPoint, body.toString(), options);
    }


    assignVisitToReason(uuid: string, reasonUrl: string) {
        let data = reasonUrl;
        const options = {
            headers: {
                'Content-Type': 'text/uri-list',
                'X-TenantID': this.authService.getTenantId(),
            },
            'observe': "response" as 'response', // to display the full response & as 'body' for type cast
        };
        return this.http.put(this.urlEndPoint + "/" + uuid + "/reason", data, options);
    }

    updateVisit(visit: Visit) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.put(this.urlEndPoint, visit, options);
    }

    updateVisitEndHour(url, visit: Visit) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.put(url, visit, options);
    }

    getVisits(filter: string) {
        let body = new URLSearchParams();
        body.set("filter", filter);

        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getVisit(uuid: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + uuid, options);
    }

    getVisitReason(uuid: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + uuid + "/reason", options);
    }

    getAuthorizationSignature(url: any) {
        let headers = this.authService.getHeadersTenancyDefault();
        const signatureUrl = url + "/signature";
        return this.http.get(signatureUrl, { headers, responseType: 'blob' }).pipe(mergeMap((res: Blob) => this.createImageFromBlob(res)));
    }

    getCurrentVisitUser(dni: string) {
        let params = new HttpParams({ fromString: `dniparam=${dni}` });
        let headersReq = this.authService.getHeadersJsonTenancyDefault();
        return this.http.get(this.urlEndPoint + "/search/searchCurrentVisitUser", { params: params, headers: headersReq }).pipe(
            catchError(err => of(err.status)));
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