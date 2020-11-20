import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

  userList: User[];
  @ViewChild('modalWindow') modalWindow: any;
  editionMode: boolean = false;
  userEditUuid: string;
  titleModal: string;

  constructor(
    private userService: UserService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.userService.getInternalUsers("").subscribe((res: User[]) => {
      this.userList = res;
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
}
