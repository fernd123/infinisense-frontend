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
    this.sensorTypeService.getSensorTypeList().subscribe((res: any) => {
      this.data = res._embedded.sensorTypes;
    });
  }

  public openSaveModal(sensorUrl: any): void {
    const modalRef = this.modalService.open(SensorTypeSaveComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.sensorUrl = sensorUrl;

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
        this.openSaveModal(event.data._links.self.href);
        break;
      case 'remove':
        this.sensorTypeService.deleteSensorType(event.data._links.self.href).subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }
}
