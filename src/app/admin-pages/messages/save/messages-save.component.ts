import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { MessageService } from 'src/app/core/services/message.service';
import { MessageType } from 'src/app/shared/enums/messageType.enumeration';
import { Message } from 'src/app/shared/models/message.model';

@Component({
  selector: 'infini-messages-save',
  templateUrl: './messages-save.component.html'
})
export class MessagesSaveComponent implements OnInit {

  messageForm: FormGroup;
  modalTitle: string = this.translateService.instant('message.savetitle');
  editionMode: boolean = false;
  messageerror: string = null;
  public MessageType = MessageType;

  @Input() public messageUrl;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService,
    private route: Router) { }

  ngOnInit() {
    this.messageForm = this.formBuilder.group({
      name: ["", Validators.required],
      type: ["", Validators.required]
    });
    if (this.messageUrl != null) {
      this.editionMode = true;
      this.messageService.getMessageByUuid(this.messageUrl).subscribe((res: Message) => {
        this.messageForm.get('name').setValue(res.name);
        this.messageForm.get('type').setValue(res.type);
      });
    }
  }

  submit() {
    let message = new Message();
    message.name = this.messageForm.get('name').value;
    message.type = this.messageForm.get('type').value;

    this.messageService.saveMessage(this.messageUrl, message).subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, EPI ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
      this.editionMode = false;
    },
      (error: any) => {
        if (error.error.message == 'Data Integrity') {
          this.messageerror = "Ya existe un registro con el mismo nombre o tipo";
        } else {
          let message = this.translateService.instant(`error.${error.error.message}`);
          this.messageForm.get(error.error.fieldName).setErrors({ 'incorrect': true, 'message': message });
        }

      });
  }

  delete() {
    this.messageService.deleteMessage(this.messageUrl).subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, Motivo de visita eliminado correctamente`, options);
      this.editionMode = false;
    });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

