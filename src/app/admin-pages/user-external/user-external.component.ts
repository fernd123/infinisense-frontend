import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { UserService } from 'src/app/core/services/user.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';

@Component({
  selector: 'infini-user-external',
  templateUrl: './user-external.component.html',
  styleUrls: ['./user-external.component.scss']
})
export class UserExternalComponent implements OnInit {

  data: User[];
  /* Table Settings */
  settings = {
    columns: {
      firstname: {
        title: this.translateService.instant('user.firstname'),
        width: '20%'
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
      company: {
        title: this.translateService.instant('user.company'),
      }
    },
    actions: {
      columnTitle: this.translateService.instant('actions'),
      add: false,
      edit: false,
      delete: false,
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
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.userService.getExternalUsers().subscribe((res: User[]) => {
      this.data = res;
    });
  }

  getWeekDates() {

    let now = new Date();
    let dayOfWeek = now.getDay(); //0-6
    let numDay = now.getDate();

    let start = new Date(now); //copy
    start.setDate(numDay - dayOfWeek);
    start.setHours(0, 0, 0, 0);


    let end = new Date(now); //copy
    end.setDate(numDay + (7 - dayOfWeek));
    end.setHours(0, 0, 0, 0);

    return [start, end];
  }

}
