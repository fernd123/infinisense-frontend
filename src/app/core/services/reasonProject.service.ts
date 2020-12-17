import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BASEURL_DEV_REASON_PROJECT_PARTICIPANT, BASEURL_DEV_REASON_PROJECT_TOKEN } from 'src/app/shared/constants/app.constants';
import { Reason } from 'src/app/shared/models/reason.model';
import { AuthenticationService } from './authentication.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReasonProjectEmail } from 'src/app/shared/models/reasonProjectEmail.model';

@Injectable({ providedIn: 'root' })
export class ReasonProjectService {

    urlEndPoint: string = BASEURL_DEV_REASON_PROJECT_PARTICIPANT;
    urlEndPointToken: string = BASEURL_DEV_REASON_PROJECT_TOKEN;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    getData(url: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(url, options).pipe(
            catchError(err => of(err.status))
        );
    }

    createProjectParticipant(userUrl: string, reasonUrl: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        let projectParticipant: any = {};
        projectParticipant.user = userUrl;
        projectParticipant.reason = reasonUrl;
        projectParticipant.active = true;
        return this.http.post(this.urlEndPoint, projectParticipant, options);
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


    getParticipantsByProject() {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getProjectToken(tokenUuid: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(`${this.urlEndPointToken}/${tokenUuid}`, options).pipe(
            catchError(err => of(err.status))
        );
    }

    updateProjectEmailAnswer(reasonProjectEmailUrl: string, reasonProjectEmail: ReasonProjectEmail) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.put(reasonProjectEmailUrl, reasonProjectEmail, options);
    }
}