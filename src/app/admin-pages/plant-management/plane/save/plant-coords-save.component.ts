import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';

@Component({
  selector: 'infini-plant-coords-save',
  templateUrl: './plant-coords-save.component.html'
})
export class PlantCoordsSaveComponent implements OnInit {

  plantCoordsForm: FormGroup;
  modalTitle: string = this.translate.instant('plant.newcoordinatetitle');

  zoneTypeList: any = [
    { value: "", name: "Tipo de virtualización" },
    { value: "zv", name: "Zona" },
    { value: "se", name: "Sensor" },
    { value: "pe", name: "Punto encuentro" }
  ];

  statusList: any = [
    { value: "Activo", name: "Activo" },
    { value: "Mantenimiento", name: "Mantenimiento" },
    { value: "Fuera de Servicio", name: "Fuera de Servicio" }
  ];

  sensorTypeList: SensorType[];

  epiList: any[] = [
    { value: "casco", name: "Casco" },
    { value: "guante", name: "Guantes" },
    { value: "mascarilla1", name: "Mascarilla FFP2" },
    { value: "chaleco", name: "Chaleco reflectante" },
    { value: "botas", name: "Botas" }
  ]

  @Input() public selectedAreaId;
  @Input() public plantId;
  @Input() public coordinates;
  @Input() public sensorTypeId;
  @Input() public typeConfig;
  @Input() public selection: boolean = false;

  epis: string;

  constructor(
    private formBuilder: FormBuilder,
    private plantCoordService: PlantCoordsService,
    private sensorTypeService: SensorTypeService,
    private translate: TranslateService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.plantCoordsForm = this.formBuilder.group({
      uuid: [null],
      name: ["", Validators.required],
      virtualZoneType: ["", Validators.required],
      sensorType: ["", null],
      coordinates: [""],
      sensorId: [""],
      status: [""]
    });

    this.plantCoordsForm.get('virtualZoneType').disable();
    this.plantCoordsForm.get('sensorType').disable();
    this.plantCoordsForm.get('virtualZoneType').setValue(this.typeConfig);

    if(this.sensorTypeId != undefined){
      this.plantCoordsForm.get('sensorType').setValue(this.sensorTypeId);
    }

    this.sensorTypeService.getSensorTypeList("").subscribe((res: SensorType[]) => {
      this.sensorTypeList = res;
    });

    if (this.selectedAreaId != null && this.selectedAreaId != "") {
      this.plantCoordService.getPlantCoordinateByUuid(this.plantId, this.selectedAreaId).subscribe((res: PlantCoordinates) => {
        this.plantCoordsForm.get('uuid').setValue(res.uuid);
        this.plantCoordsForm.get('name').setValue(res.name);
        this.plantCoordsForm.get('virtualZoneType').setValue(res.virtualZoneType);
        this.plantCoordsForm.get('sensorType').setValue(res.sensorType?.uuid);
        this.plantCoordsForm.get('sensorId').setValue(res.sensorId);
        this.plantCoordsForm.get('status').setValue(res.status);
        if(!this.selection){
          this.coordinates = res.coordinates;
        }
        this.epis = res.epis;
      });
    }
  }

  markEpisCheckbox() {
    let episInput = document.getElementsByClassName('form-check-input');
    if (episInput != undefined) {
      let episList = this.epis != null && this.epis.length > 0 ? this.epis.split(',') : [];
      for (let i = 0; i < episInput.length; i++) {
        let checkbox: any = episInput[i];
        if (episList.includes(checkbox.id)) {
          checkbox.checked = true;
        }
      }
    }
  }

  submit() {
    let plantCoords = new PlantCoordinates();
    plantCoords.uuid = this.plantCoordsForm.get('uuid').value;
    plantCoords.name = this.plantCoordsForm.get('name').value;
    plantCoords.sensorType = this.plantCoordsForm.get('sensorType').value;
    plantCoords.sensorId = this.plantCoordsForm.get('sensorId').value;
    plantCoords.virtualZoneType = this.plantCoordsForm.get('virtualZoneType').value;
    plantCoords.plantid = this.plantId;
    plantCoords.status = this.plantCoordsForm.get('status').value;
    plantCoords.coordinates = this.coordinates;

    let epis = document.getElementsByClassName('form-check-input');
    let selectedEpis = "";
    if (epis != undefined) {
      for (let i = 0; i < epis.length; i++) {
        let checkbox: any = epis[i];
        if (checkbox.checked) {
          selectedEpis += checkbox.id + ",";
        }
      }
      selectedEpis = selectedEpis.substr(0, selectedEpis.length - 1);
    }
    plantCoords.epis = selectedEpis;

    this.plantCoordService.savePlantVirtual(plantCoords, "").subscribe(res => {
      this.modalService.dismissAll("success");
    });
  }

  delete() {
    console.log('delete');
    this.plantCoordService.deleteVirtualZone(this.plantId, this.selectedAreaId).subscribe(res => {
      this.modalService.dismissAll("success");
    });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

