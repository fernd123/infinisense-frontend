import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { EpiService } from 'src/app/core/services/epi.service';
import { Epi } from 'src/app/shared/models/epi.model';
import { Reason } from 'src/app/shared/models/reason.model';


@Component({
  selector: 'infini-epis-save',
  templateUrl: './epis-save.component.html'
})
export class EpiSaveComponent implements OnInit {

  epiForm: FormGroup;
  modalTitle: string = this.translateService.instant('epi.savetitle');
  editionMode: boolean = false;
  @Input() public epiId;

  constructor(
    private formBuilder: FormBuilder,
    private epiService: EpiService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService,
    private route: Router) { }

  ngOnInit() {
    this.epiForm = this.formBuilder.group({
      uuid: [null],
      name: ["", Validators.required],
      description: ["", Validators.required],
      active: [true]
    });
    if (this.epiId != null) {
      this.editionMode = true;
      this.epiService.getEpisByUuid(this.epiId, "").subscribe((res: Epi) => {
        this.epiForm.get('uuid').setValue(res.uuid);
        this.epiForm.get('name').setValue(res.name);
        this.epiForm.get('description').setValue(res.description);
        this.epiForm.get('active').setValue(res.active);
      });

    }
  }

  submit() {
    let reason = new Reason();
    reason.uuid = this.epiForm.get('uuid').value;
    reason.name = this.epiForm.get('name').value;
    reason.description = this.epiForm.get('description').value;
    reason.active = this.epiForm.get('active').value;

    this.epiService.saveEpi(reason, "").subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, EPI ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
      this.editionMode = false;
    });
  }

  delete() {
    let uuid = this.epiForm.get('uuid').value;
    this.epiService.deleteEpi(uuid, "").subscribe(res => {
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

