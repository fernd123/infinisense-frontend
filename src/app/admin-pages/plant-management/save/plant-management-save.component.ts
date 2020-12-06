import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { Plant } from 'src/app/shared/models/plant.model';


@Component({
  selector: 'infini-plant-management-save',
  templateUrl: './plant-management-save.component.html'
})
export class PlantManagementSaveComponent implements OnInit {

  plantForm: FormGroup;
  modalTitle: string = this.translateService.instant('plant.saveplantinfotitle');
  editionMode: boolean = false;
  @Input() public plantUrl;

  constructor(
    private formBuilder: FormBuilder,
    private plantService: PlantService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.plantForm = this.formBuilder.group({
      uuid: [null],
      name: [null, Validators.required],
      location: [null, Validators.required],
      phone: [null, Validators.required],
      alternativePhone: [""],
      maximumCapacity: [null, Validators.required]
    });

    if (this.plantUrl != null) {
      this.editionMode = true;
      this.plantService.getPlantByUuid(this.plantUrl).subscribe((res: Plant) => {
        this.plantForm.get('name').setValue(res.name);
        this.plantForm.get('location').setValue(res.location);
        this.plantForm.get('phone').setValue(res.phone);
        this.plantForm.get('alternativePhone').setValue(res.alternativePhone);
        this.plantForm.get('maximumCapacity').setValue(res.maximumCapacity);
      });
    }
  }

  hasFormError(formName: string) {
    let element = this.plantForm.get(formName);
    return element.touched && element.invalid; //&& (element.value == null || element.value == '');
  }

  submit() {
    let plant = new Plant();
    plant.name = this.plantForm.get('name').value;
    plant.location = this.plantForm.get('location').value;
    plant.phone = this.plantForm.get('phone').value;
    plant.alternativePhone = this.plantForm.get('alternativePhone').value;
    plant.maximumCapacity = this.plantForm.get('maximumCapacity').value;

    this.plantService.savePlant(this.plantUrl, plant).subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, Planta ${this.editionMode ? 'actualizada' : 'guardado'} correctamente`, options);
      this.editionMode = false;
    }, (error: any) => {
      let message = this.translateService.instant(`error.${error.error.message}`);
      this.plantForm.get(error.error.fieldName).setErrors({ 'incorrect': true, 'message': message });
    });
  }

  delete() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.plantService.deletePlant(this.plantUrl).subscribe(res => {
      this.modalService.dismissAll("success");
      this.alertService.success(`¡Éxito!, Elemento borrado correctamente`, options);

    },
      (error: any) => {
        if (error.error.message = 'Data Integrity')
          this.alertService.error(`Error, No se puede eliminar el elemento porque tiene datos relacionados`, options);
        this.modalService.dismissAll("success");
      });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

