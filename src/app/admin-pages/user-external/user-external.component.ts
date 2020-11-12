import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

  userList: User[];
  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.userService.getExternalUsers("a").subscribe((res: User[]) => {
      this.userList = res.filter( (u: User)=> {
        if(u.roles == 'VISITOR'){
          return u;
        }
      })
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
