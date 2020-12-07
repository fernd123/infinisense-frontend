import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { BASEURL_DEV_VISIT } from 'src/app/shared/constants/app.constants';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class VisitService {
    urlEndPoint: string = BASEURL_DEV_VISIT;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    saveVisit(user: User) {
        let body = new URLSearchParams();
        body.set('user', JSON.stringify(user));

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        return this.http.post(this.urlEndPoint, body.toString(), options);
    }

    /*saveVisit(visit: Visit) {
        let body = new URLSearchParams();
        body.set('visit', JSON.stringify(visit));

        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };

        return this.http.post(this.urlEndPoint, visit, options);
    }*/

    assignVisitToReason(uuid: string, reasonUrl: string) {
        let data = reasonUrl;
        const options = {
            headers: {
                'Content-Type': 'text/uri-list',
                'X-TenantID': this.authService.getTenantId(),
            },
            'observe': "response" as 'response', // to display the full response & as 'body' for type cast
        };
        return this.http.put(this.urlEndPoint+"/"+uuid+"/reason", data, options);
    }

    updateVisit(visit: Visit) {
        let body = new URLSearchParams();
        body.set('uuid', visit.uuid);
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        //TODO REVISAR
        return this.http.put(this.urlEndPoint, body.toString(), options);
    }

    getVisits(filter: string) {
        let body = new URLSearchParams();
        body.set("filter", filter);

        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

}