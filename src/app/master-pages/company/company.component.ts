import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Epi } from 'src/app/shared/models/epi.model';
import { TranslateService } from '@ngx-translate/core';
import { CompanySaveComponent } from './save/company-save.component';
import { Company } from 'src/app/shared/models/company.model';
import { CompanyService } from 'src/app/core/services/company.service';

@Component({
  selector: 'infini-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

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
    private companyService: CompanyService,
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
    this.companyService.getCompany().subscribe((res: any) => {
      this.data = res._embedded.companies;
    });
  }

  public openSaveModal(companyUrl: string, size?: string): void {
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(CompanySaveComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.companyUrl = companyUrl;

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
        this.companyService.deleteCompany(event.data._links.self.href).subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }
}
