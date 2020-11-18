import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { Reason } from 'src/app/shared/models/reason.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';
import { SensorTypeSaveComponent } from './save/sensor-type-save.component';

@Component({
  selector: 'infini-sensor-type',
  templateUrl: './sensor-type.component.html',
  styleUrls: ['./sensor-type.component.scss']
})
export class SensorTypeComponent implements OnInit {

  reasonForm: FormGroup;
  sensorTypeList: SensorType[];
  @ViewChild('modalWindow') modalWindow: any;
  editionMode: boolean = false;
  reasonEditUuid: string;
  titleModal: string;

  constructor(private formBuilder: FormBuilder,
    private sensorTypeService: SensorTypeService,
    private alertService: AlertService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.sensorTypeService.getSensorTypeList("").subscribe((res: SensorType[]) => {
      this.sensorTypeList = res;
    });
  }

  public openSaveModal(sensor: any): void {
    const modalRef = this.modalService.open(SensorTypeSaveComponent);
    modalRef.componentInstance.sensorTypeId = sensor;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshList();
      });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.reasonForm.reset();
  }
}
