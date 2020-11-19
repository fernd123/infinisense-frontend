import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantVirtualization.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantVirtualization } from 'src/app/shared/models/plantvirtualization.model';
import { Reason } from 'src/app/shared/models/reason.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';


@Component({
  selector: 'infini-visit-reason-save',
  templateUrl: './visit-reason-save.component.html'
})
export class VisitReasonSaveComponent implements OnInit {

  reasonForm: FormGroup;
  modalTitle: string = "Guardar Motivo Visita";
  editionMode: boolean = false;
  @Input() public visitReasonId;
  associationtitle: string = this.translateService.instant('reason.associatetozone');

  plantList: Plant[];
  plantZoneList: PlantVirtualization[];

  constructor(
    private formBuilder: FormBuilder,
    private reasonService: ReasonService,
    private plantService: PlantService,
    private plantZoneService: PlantCoordsService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService,
    private route: Router) { }

  ngOnInit() {

    /* Load Data */
    this.loadData();

    this.reasonForm = this.formBuilder.group({
      uuid: [null],
      name: ["", Validators.required],
      description: ["", Validators.required],
      active: [true],
      plant: [""],
      plantZone: [""],

    });
    if (this.visitReasonId != null) {
      this.editionMode = true;
      this.reasonService.getReasonByUuid(this.visitReasonId, "").subscribe((res: Reason) => {
        this.reasonForm.get('uuid').setValue(res.uuid);
        this.reasonForm.get('name').setValue(res.name);
        this.reasonForm.get('description').setValue(res.description);
        this.reasonForm.get('active').setValue(res.active);
        if (res.plantZone != undefined) {
          this.reasonForm.get('plant').setValue(res.plantZone.plant.uuid);
          this.reasonForm.get('plantZone').setValue(res.plantZone.uuid);
          this.loadData();
          this.loadPlantZone();
        }
      });

    }
  }

  loadData() {
    this.plantService.getPlants("").subscribe((res: Plant[]) => {
      this.plantList = res;
    });
  }

  loadPlantZone(removePlantZone = false) {
    this.plantZoneService.getPlantCoordinates(this.reasonForm.get('plant').value, "").subscribe((res: PlantVirtualization[]) => {
      this.plantZoneList = res.filter(r => { return r.virtualZoneType == 'zv' });
      if (removePlantZone) {
        this.reasonForm.get('plantZone').setValue(null);
      }
    });
  }

  submit() {
    let reason = new Reason();
    reason.uuid = this.reasonForm.get('uuid').value;
    reason.name = this.reasonForm.get('name').value;
    reason.description = this.reasonForm.get('description').value;
    reason.active = this.reasonForm.get('active').value;
    reason.plantZone = this.reasonForm.get('plantZone').value;

    this.reasonService.saveReason(reason, "").subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, motivo ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
      this.editionMode = false;
    });
  }

  delete() {
    let uuid = this.reasonForm.get('uuid').value;
    this.reasonService.deleteReason(uuid, "").subscribe(res => {
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

