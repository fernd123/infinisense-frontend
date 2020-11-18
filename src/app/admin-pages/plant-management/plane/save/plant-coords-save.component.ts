import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantVirtualization.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { PlantVirtualization } from 'src/app/shared/models/plantvirtualization.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';


@Component({
  selector: 'infini-plant-coords-save',
  templateUrl: './plant-coords-save.component.html'
})
export class PlantCoordsSaveComponent implements OnInit {

  plantCoordsForm: FormGroup;
  modalTitle: string = "Guardar zona virtual";

  zoneTypeList: any = [
    { value: "", name: "Tipo de virtualización" },
    { value: "zv", name: "Zona" },
    { value: "se", name: "Sensor" },
    { value: "pe", name: "Punto encuentro" }
  ];

  sensorTypeList: SensorType[];

  @Input() public selectedAreaId;
  @Input() public plantId;
  @Input() public coordinates;

  constructor(
    private formBuilder: FormBuilder,
    private plantCoordService: PlantCoordsService,
    private sensorTypeService: SensorTypeService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private route: Router) { }

  ngOnInit() {
    this.plantCoordsForm = this.formBuilder.group({
      uuid: [null],
      name: ["", Validators.required],
      virtualZoneType: ["", Validators.required],
      sensorType: ["", null],
      coordinates: [""],
      sensorId: [""]
    });

    this.sensorTypeService.getSensorTypeList("").subscribe((res: SensorType[]) => {
      this.sensorTypeList = res;
    });

    if (this.selectedAreaId != null && this.selectedAreaId != "") {
      this.plantCoordService.getPlantCoordinateByUuid(this.plantId, this.selectedAreaId).subscribe((res: PlantVirtualization) => {
        this.plantCoordsForm.get('uuid').setValue(res.uuid);
        this.plantCoordsForm.get('name').setValue(res.name);
        this.plantCoordsForm.get('virtualZoneType').setValue(res.virtualZoneType);
        this.plantCoordsForm.get('sensorType').setValue(res.sensorType);
        this.plantCoordsForm.get('sensorId').setValue(res.sensorId);
        this.coordinates = res.coordinates;
      });
    }
  }

  submit() {
    let plantCoords = new PlantVirtualization();
    plantCoords.uuid = this.plantCoordsForm.get('uuid').value;
    plantCoords.name = this.plantCoordsForm.get('name').value;
    plantCoords.sensorType = this.plantCoordsForm.get('sensorType').value;
    plantCoords.sensorId = this.plantCoordsForm.get('sensorId').value;
    plantCoords.virtualZoneType = this.plantCoordsForm.get('virtualZoneType').value;
    plantCoords.plantid = this.plantId;
    plantCoords.coordinates = this.coordinates;
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

