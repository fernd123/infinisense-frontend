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

    saveEpi(epiUrl: string, epi: Epi) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };

        if (epiUrl == null) {
            return this.http.post(this.urlEndPoint, epi, options);
        } else {
            return this.http.put(epiUrl, epi, options);
        }
    }

    getEpis() {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getEpisByUuid(epiUrl: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(epiUrl, options);
    }

    deleteEpi(epiUrl: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(epiUrl, options);
    }

}