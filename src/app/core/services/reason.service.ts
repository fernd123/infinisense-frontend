import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BASEURL_DEV_REASON } from 'src/app/shared/constants/app.constants';
import { Reason } from 'src/app/shared/models/reason.model';
import { AuthenticationService } from './authentication.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReasonService {

    urlEndPoint: string = BASEURL_DEV_REASON;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    getData(url: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(url, options).pipe(
            catchError(err => of(err.status)),
        );
    }

    saveReason(reasonUrl: string, reason: Reason) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };

        if (reasonUrl == null) {
            return this.http.post(this.urlEndPoint, reason, options);
        } else {
            return this.http.put(reasonUrl, reason, options);
        }
    }

    createProject(reasonUrl: string, mailList: any) {
        let params = new HttpParams().set('emaillist', mailList.toString());
        return this.http.post(reasonUrl+"/project", { params: params, headers : this.authService.getHeadersJsonTenancyDefault() });
    }

    assignCoordinateToReason(reasonUrl: string, coordinateUrl: string) {
        let data = coordinateUrl;
        const options = {
            headers: {
                'Content-Type': 'text/uri-list',
                'X-TenantID': this.authService.getTenantId(),
            },
            'observe': "response" as 'response', // to display the full response & as 'body' for type cast
        };
        return this.http.put(reasonUrl, data, options);
    }

    deleteCoordinateReason(reasonUrl: String) {
        const options = {
            headers: {
                'X-TenantID': this.authService.getTenantId(),
            },
            'observe': "response" as 'response', // to display the full response & as 'body' for type cast
        };
        return this.http.delete(reasonUrl + '/plantCoordinate', options);
    }


    getReasons() {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getReasonByUuid(reasonUrl: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(reasonUrl, options);
    }

    getZoneReasonByUuid(uuid: any) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/zone" + uuid, options);
    }

    deleteReason(reasonUrl: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.delete(reasonUrl, options);
    }

}