import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { EpiService } from 'src/app/core/services/epi.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Epi } from 'src/app/shared/models/epi.model';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { Reason } from 'src/app/shared/models/reason.model';
import { Visit } from 'src/app/shared/models/visit.model';


@Component({
  selector: 'infini-visit-cancel',
  templateUrl: './visit-cancel.component.html'
})
export class VisitCancelComponent implements OnInit {

  cancelForm: FormGroup;
  modalTitle: string = this.translateService.instant('visit.editvisittitle');
  editionMode: boolean = false;
  @Input() public visitUuid;
  visit: Visit;
  iscanceled: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private visitService: VisitService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {

    this.cancelForm = this.formBuilder.group({
      canceledreason: [null, Validators.required]
    });

    if (this.visitUuid != null) {
      this.editionMode = true;
      this.visitService.getVisit(this.visitUuid).subscribe((res: Visit) => {
        if (res != undefined) {
          this.visit = res;
          let canceledreason = this.visit.canceledreason;
          if (canceledreason != null && canceledreason != "") {
            this.cancelForm.get('canceledreason').setValue(canceledreason);
            this.cancelForm.get('canceledreason').disable();
          }
          this.iscanceled = res.canceled;
          /*this.visitForm.get('dni').setValue(res.dni);
          this.visitForm.get('firstname').setValue(res.firstname);
          this.visitForm.get('lastname').setValue(res.lastname);*/
        }

      });
    }
  }

  ngAfterViewInit() {
  }

  submit() {
    this.visit.uuid = this.visitUuid;
    this.visit.canceled = true;
    this.visit.canceledreason = this.cancelForm.get('canceledreason').value;

    this.visitService.updateVisit(this.visit).subscribe((res: any) => {
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success("Visita actualizada correctamente", options);
      this.closeModal();
    })
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

