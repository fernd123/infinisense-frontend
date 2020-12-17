import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageMapCreatorService } from 'src/app/core/services/imageMapCreator.service';
import { MessageService } from 'src/app/core/services/message.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { Reason } from 'src/app/shared/models/reason.model';
import { MessageType } from 'src/app/shared/enums/messageType.enumeration';
import { Message } from 'src/app/shared/models/message.model';


@Component({
  selector: 'infini-register-visit-confirm',
  templateUrl: './register-visit-confirmation.component.html',
  styleUrls: ['./register-visit-confirmation.component.scss']
})
export class RegisterVisitConfirmationComponent implements OnInit {

  plantCoordsForm: FormGroup;
  modalTitle: string = "Mensaje del sistema";
  @Input() name: string;
  @Input() visit: any;
  @Input() isProject: boolean;

  reason: Reason;
  image: any;
  height: number;
  width: number;

  title: string;
  body: string;
  done: boolean = false;

  cardbody: any;
  bodydiv: any;

  constructor(
    private modalService: NgbModal,
    private messageService: MessageService,
    private reasonService: ReasonService,
    private visitService: VisitService
  ) { }

  // mdi mdi-check-circle-outline
  ngOnInit() {

    this.reasonService.getData(this.visit._links.reason.href).subscribe((resReason: Reason) => {
      this.reason = resReason;
    });

    if (this.isProject) {
      this.title = `Mensaje para ${this.name}`;
      this.body = `<div style="color:red"><strong>¿Ha completado todo el trabajo?</strong></div>`;

      this.bodydiv = document.getElementById('bodydiv');
      this.cardbody = document.getElementById('cardbody');

      if (this.body != undefined)
        this.bodydiv.innerHTML = this.body;
    } else {
      this.confirm(false);
    }
  }

  confirm(finishProject: boolean) {
    let epiMessage = "";
    this.body = "";
    this.visit.endDate = new Date().getTime();
    this.visitService.updateVisitEndHour(this.visit._links.self.href, this.visit).subscribe((resVisit: any) => {
      this.reason.finished = finishProject;
      let epis = resVisit.epis;
      if (epis != null && epis != '') {
        this.messageService.getMessageByType(MessageType.RETURNEPIS).subscribe((resEpiMsg: Message) => {
          epiMessage = `<div style="color:red">${resEpiMsg.name}`;
          let episList = epis.split(',');
          epiMessage += "<br>";
          for (let i = 0; i < episList.length; i++) {
            epiMessage += '<div class="col-sm-6"><i class="mdi mdi mdi-check-circle-outline"></i>' + episList[i] + "</div>";
          }
          this.body += '</div>' + epiMessage;
        });
      }

      this.reasonService.saveReason(this.reason._links.self.href, this.reason).subscribe((resReason: Reason) => {
        this.messageService.getMessageByType(MessageType.REGISTEREND).subscribe((resEndMsg: Message) => {
          this.done = true;
          this.body += `<div style="color:blue"><strong>${resEndMsg.name}</strong></div>`;

          this.bodydiv = document.getElementById('bodydiv');
          this.cardbody = document.getElementById('cardbody');

          this.bodydiv.innerHTML = this.body;
        });
      });

      // Comprobar si se han dejado EPIS
      // Comprobar si está en un proyecto
    });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }



}

