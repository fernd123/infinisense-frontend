import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { forkJoin } from 'rxjs';
import { ReasonService } from 'src/app/core/services/reason.service';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { VisitReasonSaveComponent } from './save/visit-reason-save.component';

@Component({
  selector: 'infini-visit-reason',
  templateUrl: './visit-reason.component.html',
  styleUrls: ['./visit-reason.component.scss']
})
export class VisitReasonComponent implements OnInit {

  data: any[];
  @ViewChild('modalWindow') modalWindow: any;
  editionMode: boolean = false;
  reasonEditUuid: string;
  titleModal: string;
  public source = new LocalDataSource();


  /* Table Settings */
  settings = {
    columns: {
      name: {
        title: this.translateService.instant('reason.reason'),
        width: '20%'
      },
      description: {
        title: this.translateService.instant('description'),
      },
      plantCoordinate: {
        title: this.translateService.instant('reason.relatedto'),
        //type: 'custom',
        //renderComponent: CustomRenderComponent
        valuePrepareFunction: (cell, row) => {
          return cell;
        }
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
    private reasonService: ReasonService,
    private translateService: TranslateService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.reasonService.getReasons().subscribe((res: any) => {
      this.data = res._embedded.reasons;
      let getRequest = [];
      let dataUpdate = [];
      for (let i = 0; i < this.data.length; i++) {
        let plantZoneUrl = this.data[i]._links.plantCoordinate.href;
        getRequest.push(this.reasonService.getData(plantZoneUrl));
        dataUpdate.push(this.data[i]);
        /*this.reasonService.getData(plantZoneUrl).subscribe((resZone: any) => {
          this.data[i].plantCoordinate = resZone.name;
          this.source.load(this.data);
        },
          (error: any) => {

          });
      }*/
      }
      /* Hacemos todas las peticiones para setear el campo de la relación y actualizar la tabla */
      forkJoin(getRequest).subscribe((res: PlantCoordinates[]) => {
        for (let i = 0; i < res.length; i++) {
          dataUpdate[i].plantCoordinate = res[i].name;
        }
        this.source.load(dataUpdate);
      },
        (error: any) => { console.log(error); });
    });
  }

  public openSaveModal(reasonUrl: string, size?: string): void {
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(VisitReasonSaveComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.reasonUrl = reasonUrl;

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
        this.reasonService.deleteReason(event.data._links.self.href).subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }
}
