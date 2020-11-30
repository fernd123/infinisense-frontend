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

    saveVisit(visit: Visit, user: User) {
        let body = new URLSearchParams();
        body.set('visit', JSON.stringify(visit));
        body.set('user', JSON.stringify(user));

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        return this.http.post(this.urlEndPoint, body.toString(), options);
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