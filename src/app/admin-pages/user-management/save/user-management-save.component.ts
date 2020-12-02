import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/shared/models/user.model';


@Component({
  selector: 'infini-user-management-save',
  templateUrl: './user-management-save.component.html'
})
export class UserManagementSaveComponent implements OnInit {

  userForm: FormGroup;
  modalTitle: string = this.translateService.instant('user.saveusertitle');
  editionMode: boolean = false;
  roleList: any[] = [
    { value: "ADMIN" }, { value: "USER" }, { value: "MASTER" }
  ];

  @Input() public userId;
  @ViewChild('selectrole') selectElRef;


  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService
  ) { }

  ngOnInit() {

    this.userForm = this.formBuilder.group({
      uuid: [null],
      username: ["", Validators.required],
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      password: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      dni: ["", Validators.required],
      roles: ["", Validators.required],
      active: ["true"]
    });
    if (this.userId != null) {
      this.editionMode = true;
      this.userService.getUserByUuid(this.userId).subscribe((res: User) => {
        if (res != undefined) {
          this.userForm.get('uuid').setValue(res.uuid);
          this.userForm.get('username').setValue(res.username);
          this.userForm.get('firstname').setValue(res.firstname);
          this.userForm.get('lastname').setValue(res.lastname);
          this.userForm.get('active').setValue(res.active);
          this.userForm.get('roles').setValue(res.roles);
          this.userForm.get('email').setValue(res.email);
          this.userForm.get('dni').setValue(res.dni);
          this.updateSelectList();
        }
      });
    }
  }

  updateSelectList() {
    let options = this.selectElRef.nativeElement.options;
    for (let i = 0; i < options.length; i++) {
      options[i].selected = this.userForm.get('roles').value.includes(this.roleList[0].value);
    }
  }

  submit() {
    let user = new User();
    user.uuid = this.userForm.get('uuid').value;
    user.username = this.userForm.get('username').value;
    user.firstname = this.userForm.get('firstname').value;
    user.lastname = this.userForm.get('lastname').value;
    user.password = this.userForm.get('password').value;
    user.dni = this.userForm.get('dni').value;
    user.email = this.userForm.get('email').value;
    user.roles = this.userForm.get('roles').value;
    user.active = this.userForm.get('active').value;

    this.userService.saveUser(user).subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, usuario ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
      this.editionMode = false;
    });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

