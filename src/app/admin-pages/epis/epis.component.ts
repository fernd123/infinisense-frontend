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
    private formBuilder: FormBuilder,
    private epiService: EpiService,
    private translateService: TranslateService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
    this.reasonForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      active: [true],
      association: [null]
    });
  }

  refreshList() {
    this.epiService.getEpis().subscribe((res: Epi[]) => {
      this.data = res;
    });
  }

  public openSaveModal(uuid: string, size?: string): void {
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(EpiSaveComponent);
    modalRef.componentInstance.epiId = uuid;

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
        this.openSaveModal(event.data.uuid);
        break;
      case 'remove':
        this.epiService.deleteEpi(event.data.uuid).subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }
}
