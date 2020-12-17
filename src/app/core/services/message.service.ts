import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BASEURL_DEV_MESSAGE } from 'src/app/shared/constants/app.constants';
import { Message } from 'src/app/shared/models/message.model';
import { AuthenticationService } from './authentication.service';
import { MessageType } from 'src/app/shared/enums/messageType.enumeration';

@Injectable({ providedIn: 'root' })
export class MessageService {

    urlEndPoint: string = BASEURL_DEV_MESSAGE;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    saveMessage(messageUrl: string, message: Message) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };

        if (messageUrl == null) {
            return this.http.post(this.urlEndPoint, message, options);
        } else {
            return this.http.put(messageUrl, message, options);
        }
    }

    getMessages() {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getMessageByUuid(messageUrl: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(messageUrl, options);
    }

    getMessageByType(type: MessageType) {
        let params = new HttpParams({ fromString: `type=${type}` });
        let headersReq = this.authService.getHeadersJsonTenancyDefault();
        return this.http.get(this.urlEndPoint + "/search/findByType", { params: params, headers: headersReq });
    }

    deleteMessage(messageUrl: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(messageUrl, options);
    }

}