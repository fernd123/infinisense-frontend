import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EpiService } from 'src/app/core/services/epi.service';
import { Epi } from 'src/app/shared/models/epi.model';
import { EpiSaveComponent } from './save/epis-save.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'infini-epis',
  templateUrl: './epis.component.html',
  styleUrls: ['./epis.component.scss']
})
export class EpiComponent implements OnInit {

  @ViewChild('modalWindow') modalWindow: any;
  data: Epi[];
  reasonForm: FormGroup;
  editionMode: boolean = false;
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
    private epiService: EpiService,
    private translateService: TranslateService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.epiService.getEpis().subscribe((res: any) => {
      this.data = res._embedded.epis;
    });
  }

  public openSaveModal(epiUrl: string, size?: string): void {
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(EpiSaveComponent);
    modalRef.componentInstance.epiUrl = epiUrl;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshList();
      });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.reasonForm.reset();
  }

  onCustomAction(event) {
    switch (event.action) {
      case 'edit':
        this.openSaveModal(event.data._links.self.href);
        break;
      case 'remove':
        this.epiService.deleteEpi(event.data._links.self.href).subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }
}
