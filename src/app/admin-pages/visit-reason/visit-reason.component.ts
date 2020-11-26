import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { Reason } from 'src/app/shared/models/reason.model';
import { VisitReasonSaveComponent } from './save/visit-reason-save.component';

@Component({
  selector: 'infini-visit-reason',
  templateUrl: './visit-reason.component.html',
  styleUrls: ['./visit-reason.component.scss']
})
export class VisitReasonComponent implements OnInit {

  data: Reason[];
  @ViewChild('modalWindow') modalWindow: any;
  editionMode: boolean = false;
  reasonEditUuid: string;
  titleModal: string;

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
      plantZone: {
        title: this.translateService.instant('reason.relatedto'),
        valuePrepareFunction: (data) => {
          if (data != null) {
            return `${data.name} - ${data.plant?.name}`;
          }
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
    this.reasonService.getReasons("").subscribe((res: Reason[]) => {
      this.data = res;
    });
  }

  public openSaveModal(uuid: string, size?: string): void {
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(VisitReasonSaveComponent);
    modalRef.componentInstance.visitReasonId = uuid;

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
        this.reasonService.deleteReason(event.data.uuid, "").subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }
}
