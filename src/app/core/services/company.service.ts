import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASEURL_DEV_COMPANY } from 'src/app/shared/constants/app.constants';
import { AuthenticationService } from './authentication.service';
import { Company } from 'src/app/shared/models/company.model';
import { User } from '../../shared/models/user.model';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CompanyService {


    urlEndPoint: string = BASEURL_DEV_COMPANY;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    createCompany(company: Company, user: User) {
        let body = new URLSearchParams();
        body.set('name', company.name);
        body.set('description', company.description);
        body.set('email', company.email);
        body.set('server', company.server);
        body.set('port', company.port);

        body.set('aliro', `${company.aliro}`);
        body.set('ergo', `${company.ergo}`);
        body.set('active', `${company.active}`);
        body.set('username', user.username);
        body.set('password', user.password);
        body.set('email', user.email);
        body.set('firstname', user.firstname);
        body.set('lastname', user.lastname);
        body.set('dni', user.dni);

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        return this.http.post(this.urlEndPoint + '/create', body.toString(), options);

    }

    saveCompany(companyUrl, company: Company) {
        let body = new URLSearchParams();
        body.set('name', company.name);
        body.set('description', company.description);
        body.set('email', company.email);
        body.set('server', company.server);
        body.set('port', company.port);
        body.set('aliro', `${company.aliro}`);
        body.set('ergo', `${company.ergo}`);
        body.set('active', `${company.active}`);
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.put(companyUrl, body.toString(), options);
    }

    getData(url) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(url, options);
    }

    getCompany() {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getCompanyByUuid(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + uuid, options);
    }

    deleteCompany(companyUrl: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(companyUrl, options);
    }

    upload(file: File, companyUrl: string): any {
        const formData: FormData = new FormData();
        formData.append('file', file);
        let headers = new HttpHeaders({
            //'Content-Type': 'application/x-www-form-urlencoded',
            //'Accept': 'application/json',
            'X-TenantID': this.authService.getTenantId(),
            'response-type': 'blob',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let options = { headers: headers };
        return this.http.post(`${companyUrl}/upload`, formData, options);
    }

    getCompanyImage(filename: string, tenantName: string) {
        let body = new URLSearchParams();
        body.set('filename', filename);
        let headers = new HttpHeaders({
            //'Content-Type': 'application/x-www-form-urlencoded',
            //'Accept': 'application/json',
            'X-TenantID': this.authService.getTenantId(),
            'response-type': 'blob',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        return this.http.get(this.urlEndPoint + `/download/${filename}/${tenantName}`, { headers, responseType: 'blob' }).pipe(mergeMap((res: Blob) => this.createImageFromBlob(res)));
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