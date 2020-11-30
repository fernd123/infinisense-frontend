import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { UserService } from 'src/app/core/services/user.service';
import { Reason } from 'src/app/shared/models/reason.model';
import { User } from 'src/app/shared/models/user.model';
import { UserManagementSaveComponent } from './save/user-management-save.component';

@Component({
  selector: 'infini-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  @ViewChild('modalWindow') modalWindow: any;
  data: User[];
  editionMode: boolean = false;
  userEditUuid: string;
  titleModal: string;
  /* Table Settings */
  settings = {
    columns: {
      firstname: {
        title: this.translateService.instant('name')
      },
      lastname: {
        title: this.translateService.instant('user.lastname'),
      },
      dni: {
        title: this.translateService.instant('user.dni'),
      },
      email: {
        title: this.translateService.instant('user.email'),
      },
      roles: {
        title: this.translateService.instant('user.roles'),
      },
      active: {
        title: this.translateService.instant('active'),
      }
    },
    actions: {
      columnTitle: this.translateService.instant('actions'),
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'edit', title: '<i class="mdi mdi-grease-pencil btn-icon-append"></i>' },
      ],
      position: 'right'
    },
    attr: {
      class: 'table table-bordered'
    },
    pager: {
      display: true,
      perPage: 10
    }
  };


  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.userService.getInternalUsers().subscribe((res: User[]) => {
      this.data = res;
    });
  }

  public openSaveModal(uuid: string, size?: string): void {
    //if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(UserManagementSaveComponent);
    modalRef.componentInstance.userId = uuid;

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
    }
  }
}
