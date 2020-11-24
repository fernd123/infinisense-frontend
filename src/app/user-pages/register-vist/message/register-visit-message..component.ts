import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { Reason } from 'src/app/shared/models/reason.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';
import { Visit } from 'src/app/shared/models/visit.model';


@Component({
  selector: 'infini-register-visit-msg',
  templateUrl: './register-visit-message.component.html'
})
export class RegisterVisitMessageComponent implements OnInit {

  plantCoordsForm: FormGroup;
  modalTitle: string = "Mensaje del sistema";
  @Input() name: string;
  @Input() visit: any;

  title: string;
  body: string;

  constructor(
    private modalService: NgbModal) { }

  // mdi mdi-check-circle-outline
  ngOnInit() {
    this.title = `Bienvenido ${this.name}`;
    if (this.visit?.reason?.plantZone != undefined) {
      this.body = `<div style="color:red"><strong>Por favor diríjase a la zona ${this.visit?.reason?.plantZone?.name}</strong></div>`;
    }

    let bodydiv = document.getElementById('bodydiv');

    let epis = this.visit?.reason?.plantZone?.epis;
    if (epis != undefined && epis.length > 0) {
      let episList = epis.split(',');
      let bodyPre = "Recuerde utilizar:";
      for (let i = 0; i < episList.length; i++) {
        bodyPre += '<div class="col-sm-6"><i class="mdi mdi mdi-check-circle-outline"></i>' + episList[i] + "</div>";
      }
      this.body = bodyPre + this.body;
    }
    if (this.body != undefined)
      bodydiv.innerHTML = this.body;
    /*this.reasonService.getZoneReasonByUuid(this.reasonId, "").subscribe((res: PlantVirtualization) => {
      if (res != undefined) {
        
      }
    });*/
  }

  submit() {

  }

  delete() {

  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

