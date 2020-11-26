import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { SensorType } from 'src/app/shared/models/sensorType.model';
import { SensorTypeSaveComponent } from './save/sensor-type-save.component';

@Component({
  selector: 'infini-sensor-type',
  templateUrl: './sensor-type.component.html',
  styleUrls: ['./sensor-type.component.scss']
})
export class SensorTypeComponent implements OnInit {

  data: SensorType[];
  @ViewChild('modalWindow') modalWindow: any;
  editionMode: boolean = false;
  reasonEditUuid: string;
  titleModal: string;

  /* Table Settings */
  settings = {
    columns: {
      name: {
        title: this.translateService.instant('name'),
        width: '20%'
      },
      description: {
        title: this.translateService.instant('description'),
      }
    },
    actions: {
      columnTitle: this.translateService.instant('actions'),
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'edit', title: '<i class="mdi mdi-grease-pencil btn-icon-append"></i>' },
        { name: 'remove', title: '<i class="mdi mdi-delete"></i>' }
      ],
      position: 'right'
    },
    edit: {
      editButtonContent: '<i class="mdi mdi-grease-pencil btn-icon-append"></i>'
    },
    attr: {
      class: 'table table-bordered'
    },
    rowClassFunction: (row) => {
      // row css
    },
    pager: {
      display: true,
      perPage: 10
    }
  };

  constructor(
    private sensorTypeService: SensorTypeService,
    private translateService: TranslateService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.sensorTypeService.getSensorTypeList("").subscribe((res: SensorType[]) => {
      this.data = res;
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
  }

  onCustomAction(event) {
    switch (event.action) {
      case 'edit':
        this.openSaveModal(event.data.uuid);
        break;
      case 'remove':
        this.sensorTypeService.deleteSensorType(event.data.uuid, "").subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }
}
