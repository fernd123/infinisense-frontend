import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASEURL_DEV_REASON } from 'src/app/shared/constants/app.constants';
import { Reason } from 'src/app/shared/models/reason.model';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class ReasonService {

    urlEndPoint: string = BASEURL_DEV_REASON;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    saveReason(reason: Reason) {
        let body = new URLSearchParams();
        body.set('name', reason.name);
        body.set('description', reason.description);
        body.set('active', `${reason.active}`);
        body.set('plantZone', reason.plantZone);

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        if (reason.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + reason.uuid, body.toString(), options);
        }
    }

    getReasons() {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getReasonByUuid(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + uuid, options);
    }

    getZoneReasonByUuid(uuid: any) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/zone" + uuid, options);
    }

    deleteReason(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(this.urlEndPoint + "/" + uuid, options);
    }

}