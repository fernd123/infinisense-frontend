import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ReasonProjectService } from 'src/app/core/services/reasonProject.service';
import { UserService } from 'src/app/core/services/user.service';
import { BASEURL_DEV_REASON_PROJECT_EMAIL, BASEURL_DEV_USER } from 'src/app/shared/constants/app.constants';
import { validateEmail, validateEmailByValue } from 'src/app/shared/form-validators/email.validator';
import { Reason } from 'src/app/shared/models/reason.model';
import { ReasonProjectEmail } from 'src/app/shared/models/reasonProjectEmail.model';
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
  reason: Reason;
  tenantId: string;
  reasonProjectEmail: ReasonProjectEmail;
  success: boolean = false;


  constructor(
    private projectParticipantService: ReasonProjectService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private translateService: TranslateService) { }

  ngOnInit() {

    this.translateService.setDefaultLang('es');
    this.translateService.addLangs(['es', 'en']);
    this.translateService.use('es');

    this.route.queryParamMap.subscribe((params: any) => {
      this.tokenUuid = params.params.token;
      this.tenantId = params.params.tenant;

      if (this.tokenUuid == null || this.tenantId == null) {
        this.router.navigate(['error-pages/404']);
      } else {
        localStorage.setItem('tenantid', this.tenantId);

        this.projectParticipantService.getProjectToken(this.tokenUuid).subscribe((res: any) => {
          if (res == 500) {
            this.router.navigate(['error-pages/404']);
          }

          let token = res.token;
          let tokenInfo: any = this.authService.getTokenInfoByToken(token);
          let projectEmailUuid = tokenInfo.reasonProjectEmailUuid;
          localStorage.setItem('token', token);

          if (this.authService.isTokenExpired(token)) {
            this.router.navigate(['error-pages/404']);
          }

          this.projectParticipantService.getData(res._links.reason.href).subscribe((resReason: Reason) => {
            this.reason = resReason;
          });

          this.projectParticipantService.getData(BASEURL_DEV_REASON_PROJECT_EMAIL + "/" + projectEmailUuid).subscribe((resProjectEmail: ReasonProjectEmail) => {
            this.reasonProjectEmail = resProjectEmail;
            if (this.reasonProjectEmail.answered) {
              this.router.navigate(['error-pages/404']);
            }
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
      if (this.attributes[i] == 'Dni') {
        input.addEventListener("change", (event) => {
          //TODO: cargar datos? peligroso seguridad
        })
      }

      formRowDiv.appendChild(colDiv);
      colDiv.appendChild(labelFirstname);
      colDiv.appendChild(input);
      parentElement.appendChild(formRowDiv);
    }
  }

  submit() {
    let userListReq = [];
    let userListExistDni = [];
    let userListCheckDniReq = [];
    let userNewList = [];

    let companyElement: any = document.getElementById('company');
    let company = companyElement.value;
    let employeeElements: any = document.getElementsByName('employeegroup');
    for (let i = 0; i < employeeElements.length; i++) {
      let firstnameElem = employeeElements[i].children[0].children[1];
      let lastnameElem = employeeElements[i].children[1].children[1];
      let emailElem = employeeElements[i].children[2].children[1];
      let dniElem = employeeElements[i].children[3].children[1];

      let firstname = firstnameElem.value.trim();
      let lastname = lastnameElem.value.trim();
      let email = emailElem.value.trim();
      let dni = dniElem.value.trim();


      // Delete div error
      firstnameElem.parentElement.children.length == 3 ?
        firstnameElem.parentElement.children[2].remove() : null;

      lastnameElem.parentElement.children.length == 3 ?
        lastnameElem.parentElement.children[2].remove() : null;

      emailElem.parentElement.children.length == 3 ?
        emailElem.parentElement.children[2].remove() : null;

      dniElem.parentElement.children.length == 3 ?
        dniElem.parentElement.children[2].remove() : null;

      if (firstname == '') {
        this.createDivError(firstnameElem, this.translateService.instant('error.empty.value'));
        return;
      } else {
        firstnameElem.classList.remove("alert-danger");
      }

      if (lastname == '') {
        this.createDivError(lastnameElem, this.translateService.instant('error.empty.value'));
        return;
      } else {
        lastnameElem.classList.remove("alert-danger");
      }


      if (email == '') {
        this.createDivError(emailElem, this.translateService.instant('error.empty.value'));
        return;
      } else {
        emailElem.classList.remove("alert-danger");
      }

      if (!validateEmailByValue(email)) {
        this.createDivError(emailElem, this.translateService.instant('error.invalid.email'));
        return;
      } else {
        emailElem.classList.remove("alert-danger");
      }

      if (dni == '') {
        this.createDivError(dniElem, this.translateService.instant('error.empty.value'));
        return;
      } else {
        dniElem.classList.remove("alert-danger");
      }

      let user: User = new User();
      user.firstname = firstname;
      user.lastname = lastname;
      user.email = email;
      user.dni = dni;
      user.roles = "VISITOR";
      user.company = company;
      user.active = true;
      user.username = dni;
      userNewList.push(user);
      userListCheckDniReq.push(this.userService.getUserByDni(user.dni));/*.subscribe((resUserDni: User) => {
        if (resUserDni == undefined) {
          userListReq.push(this.userService.saveUser(null, user));
        } else {
          userListExistDni.push(resUserDni);
        }
      });*/
    }


    forkJoin(userListCheckDniReq).subscribe((resCheckDni) => {
      for (let i = 0; i < resCheckDni.length; i++) {
        if (resCheckDni[i] == 500) {
          userListReq.push(this.userService.saveUser(null, userNewList[i]));
        } else {
          userListExistDni.push(resCheckDni[i]);
        }
      }

      // IF here are new users Create or retain the users
      if (userListReq.length > 0) {
        forkJoin(userListReq).subscribe((res: User[]) => {
          let participantListReq = [];

          // For new users
          for (let i = 0; i < res.length; i++) {
            participantListReq.push(this.projectParticipantService.createProjectParticipant(res[i]._links.self.href, this.reason._links.self.href));
          }

          // For users that exists
          for (let i = 0; i < userListExistDni.length; i++) {
            participantListReq.push(this.projectParticipantService.createProjectParticipant(userListExistDni[i]._links.self.href, this.reason._links.self.href));
          }
          this.createParticipantsInProject(participantListReq);
        });
      } else {
        let participantListReq = [];
        // For users that exists
        for (let i = 0; i < userListExistDni.length; i++) {
          participantListReq.push(this.projectParticipantService.createProjectParticipant(userListExistDni[i]._links.self.href, this.reason._links.self.href));
        }
        this.createParticipantsInProject(participantListReq);
      }
    });
  }

  createParticipantsInProject(participantListReq) {
    forkJoin(participantListReq).subscribe((resParticipant: any) => {
      this.reasonProjectEmail.answered = true;
      // Update project email answer
      this.projectParticipantService.updateProjectEmailAnswer(this.reasonProjectEmail._links.self.href, this.reasonProjectEmail).subscribe((resEmail: any) => {
        let formdiv = document.getElementById('formdiv');
        formdiv.hidden = true;

        this.success = true;
        localStorage.clear();
      });
    });
  }

  createDivError(element, message) {
    element.classList.add("alert-danger");
    let divElem = document.createElement("div");
    divElem.classList.add("invalid-feedback");
    divElem.innerText = message;
    element.parentElement.insertBefore(divElem, element.nextSibling);
  }
}
