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
  @Input() public epiUrl;

  constructor(
    private formBuilder: FormBuilder,
    private epiService: EpiService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService,
    private route: Router) { }

  ngOnInit() {
    this.epiForm = this.formBuilder.group({
      name: ["", Validators.required],
      description: [""],
      active: [true]
    });
    if (this.epiUrl != null) {
      this.editionMode = true;
      this.epiService.getEpisByUuid(this.epiUrl).subscribe((res: Epi) => {
        this.epiForm.get('name').setValue(res.name);
        this.epiForm.get('description').setValue(res.description);
        this.epiForm.get('active').setValue(res.active);
      });

    }
  }

  submit() {
    let epi = new Epi();
    epi.name = this.epiForm.get('name').value;
    epi.description = this.epiForm.get('description').value;
    epi.active = this.epiForm.get('active').value;

    this.epiService.saveEpi(this.epiUrl, epi).subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, EPI ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
      this.editionMode = false;
    },
      (error: any) => {
        let message = this.translateService.instant(`error.${error.error.message}`);
        this.epiForm.get(error.error.fieldName).setErrors({ 'incorrect': true, 'message': message });
      });
  }

  delete() {
    this.epiService.deleteEpi(this.epiUrl).subscribe(res => {
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

