import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASEURL_DEV_EPI } from 'src/app/shared/constants/app.constants';
import { Epi } from 'src/app/shared/models/epi.model';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class EpiService {

    urlEndPoint: string = BASEURL_DEV_EPI;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    saveEpi(epi: Epi) {
        let body = new URLSearchParams();
        body.set('name', epi.name);
        body.set('description', epi.description);
        body.set('active', `${epi.active}`);

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        if (epi.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + epi.uuid, body.toString(), options);
        }
    }

    getEpis() {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getEpisByUuid(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + uuid, options);
    }

    deleteEpi(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(this.urlEndPoint + "/" + uuid, options);
    }

}