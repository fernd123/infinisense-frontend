import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { SensorType } from 'src/app/shared/models/sensorType.model';


@Component({
  selector: 'infini-sensor-type-save',
  templateUrl: './sensor-type-save.component.html'
})
export class SensorTypeSaveComponent implements OnInit {

  sensorTypeForm: FormGroup;
  modalTitle: string = this.translateService.instant('sensortype.savesensortypetitle');
  editionMode: boolean = false;
  @Input() public sensorTypeId;
  currentFile: File;

  constructor(
    private formBuilder: FormBuilder,
    private sensorTypeService: SensorTypeService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.sensorTypeForm = this.formBuilder.group({
      uuid: [null],
      name: ["", Validators.required],
      description: [null, Validators.required],
      image: [null, Validators.required],
      active: [true]
    });
    if (this.sensorTypeId != null) {
      this.editionMode = true;
      this.sensorTypeService.getSensorTypeByUuid(this.sensorTypeId, "").subscribe((res: SensorType) => {
        this.sensorTypeForm.get('uuid').setValue(res.uuid);
        this.sensorTypeForm.get('name').setValue(res.name);
        this.sensorTypeForm.get('description').setValue(res.description);
        //this.sensorTypeForm.get('image').setValue(res.image);
        this.sensorTypeForm.get('active').setValue(res.active);
        if (res.image != undefined)
          this.sensorTypeService.getSensorTypeImage(res.image, "").subscribe((res: any) => {
            this.sensorTypeForm.get('image').setValue(res);
          });
      });

    }
  }

  submit() {
    let sensorType = new SensorType();
    sensorType.uuid = this.sensorTypeForm.get('uuid').value;
    sensorType.name = this.sensorTypeForm.get('name').value;
    sensorType.description = this.sensorTypeForm.get('description').value;
    //sensorType.image = this.sensorTypeForm.get('image').value;
    sensorType.active = this.sensorTypeForm.get('active').value;

    this.sensorTypeService.saveSensorType(sensorType, "").subscribe((res: SensorType) => {
      if (this.currentFile != undefined) {
        this.sensorTypeService.upload(this.currentFile, res.uuid).subscribe(resimg => {
          this.currentFile = undefined;
          this.showSuccessAlert();
        });
      } else {
        this.showSuccessAlert();
      }
    });
  }

  private showSuccessAlert() {
    this.modalService.dismissAll("success");
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.alertService.success(`¡Éxito!, Tipo de sensor ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
    this.editionMode = false;
  }

  delete() {
    let uuid = this.sensorTypeForm.get('uuid').value;
    this.sensorTypeService.deleteSensorType(uuid, "").subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, Tipo de sensor eliminado correctamente`, options);
      this.editionMode = false;
    },
      error => {
        this.modalService.dismissAll("error");
        let options = {
          autoClose: true,
          keepAfterRouteChange: true
        };
        this.alertService.error(`Error, el tipo de sensor no se puede eliminar porque tiene elementos relacionados`, options);
        this.editionMode = false;
      });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }

  readURL(input) {
    let self = this;
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      self.currentFile = input.files[0];

      reader.onload = function (e) {
        self.sensorTypeForm.get('image').setValue(e.target.result);
        //$('#blah').attr('src', e.target.result);
      }

      reader.readAsDataURL(input.files[0]);
    }
  }

}

