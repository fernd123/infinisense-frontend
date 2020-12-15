import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ReasonProjectService } from 'src/app/core/services/reasonProject.service';
import { UserService } from 'src/app/core/services/user.service';
import { BASEURL_DEV_USER } from 'src/app/shared/constants/app.constants';
import { Reason } from 'src/app/shared/models/reason.model';
import { ReasonProjectToken } from 'src/app/shared/models/reasonProjectToken.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'infini-update-project',
  templateUrl: './update-project.component.html',
  styleUrls: ['./update-project.component.scss']
})
export class UpdateProjectComponent implements OnInit {

  attributes = [];
  registerForm: FormGroup;
  numberOfEmployees: number = 0;
  tokenUuid: string;
  reason : Reason;
  success: boolean;

  constructor(
    private projectParticipantService: ReasonProjectService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private translationService: TranslateService) { }

  ngOnInit() {

    this.route.queryParamMap.subscribe((params: any) => {
      debugger;
      this.tokenUuid = params.params.token;
      if (this.tokenUuid == null) {
        this.router.navigate(['error-pages/404']);
      } else {
        this.projectParticipantService.getProjectToken(this.tokenUuid).subscribe((res: ReasonProjectToken) => {
          debugger;
          if(res == undefined){
            this.router.navigate(['error-pages/404']);
          }
          let token = res.token;
          
          if(this.authService.isTokenExpired(token)){
            this.router.navigate(['error-pages/404']);
          }

          this.projectParticipantService.getData(res._links.reason.href).subscribe( (resReason: Reason) => {
            this.reason = resReason;
          });
        });
      }
    });

    this.attributes = [
      "Nombre", "Apellido", "Email", "Dni"
    ];
    this.createFormGroup();
  }

  createFormGroup() {
    this.numberOfEmployees += 1;
    let parentElement = document.getElementById('parentDiv');

    let formRowDiv = document.createElement('div');
    formRowDiv.classList.add('form-row');
    formRowDiv.setAttribute('name', `employeegroup`);

    let title = document.createElement('h4');
    title.innerText = `Empleado ${this.numberOfEmployees}`;
    parentElement.appendChild(title);

    for (let i = 0; i < this.attributes.length; i++) {
      let colDiv = document.createElement('div');
      colDiv.classList.add('col-md-3');
      colDiv.classList.add('mb-3');

      let labelFirstname = document.createElement('label');
      labelFirstname.setAttribute('for', this.attributes[i]);
      labelFirstname.innerText = this.attributes[i];

      let input = document.createElement('input');
      input.type = 'text';
      input.classList.add('form-control');
      input.id = this.attributes[i] + this.numberOfEmployees;
      input.autocomplete = "off";

      formRowDiv.appendChild(colDiv);
      colDiv.appendChild(labelFirstname);
      colDiv.appendChild(input);
      parentElement.appendChild(formRowDiv);
    }
  }

  submit() {
    let userListReq = [];
    let companyElement: any = document.getElementById('employeegroup');
    debugger;
    let company = "";
    let employeeElements: any = document.getElementsByName('employeegroup');
    for (let i = 0; i < employeeElements.length; i++) {
      let firstname = employeeElements[i].children[0].children[1].value
      let lastname = employeeElements[i].children[1].children[1].value
      let email = employeeElements[i].children[2].children[1].value
      let dni = employeeElements[i].children[3].children[1].value

      let user: User = new User();
      user.firstname = firstname;
      user.lastname = lastname;
      user.email = email;
      user.dni = dni;
      user.roles = "VISITOR";
      user.company = company;
      user.active = true;
      user.username = dni;

      userListReq.push(this.userService.saveUser(null, user));
    }
    debugger;
    forkJoin(userListReq).subscribe((res: User[]) => {
      debugger;
      let participantListReq = []
      for (let i = 0; i < res.length; i++) {
        participantListReq.push(this.projectParticipantService.createProjectParticipant(res[i]._links.self.href, this.reason._links.self.href));
      }
      forkJoin(participantListReq).subscribe((resParticipant: any) => {
        this.success = true;
      });
    })
  }
}
