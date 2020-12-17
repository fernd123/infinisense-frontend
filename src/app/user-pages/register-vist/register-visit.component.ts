import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { UserService } from 'src/app/core/services/user.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { Reason } from 'src/app/shared/models/reason.model';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterVisitMessageComponent } from './message/register-visit-message.component';
import { forkJoin } from 'rxjs';
import { RegisterVisitConfirmationComponent } from './confirmation/register-visit-confirmation.component';

@Component({
  selector: 'infini-register-visit',
  templateUrl: './register-visit.component.html',
  styleUrls: ['./register-visit.component.scss']
})
export class RegisterVisitComponent implements OnInit {

  registerForm: FormGroup;
  loading: boolean;
  reasonList: Reason[];
  projectList: Reason[];
  @ViewChild('signaturePadC') signaturePad: any;
  @ViewChild('signatureDiv') signatureDiv: any;
  @ViewChild('registerButton') registerButton: any;

  loadSignature: boolean = true;
  userSignature = new Image();
  hasProjects: boolean = false;
  buttonTitle: string;

  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 0.5,
    'canvasWidth': 1200,
    'penColor': 'black',
    'canvasHeight': 300
  };

  constructor(
    private formBuilder: FormBuilder,
    private reasonService: ReasonService,
    private visitService: VisitService,
    private userService: UserService,
    private translate: TranslateService,
    private modalService: NgbModal,
    protected alertService: AlertService
  ) { }

  ngOnInit() {

    this.translate.setDefaultLang('es');
    this.translate.addLangs(['es', 'en']);
    this.translate.use('es');

    this.buttonTitle = this.translate.instant('register');
    this.reasonService.getReasonsByType(false).subscribe((res: any) => {
      this.reasonList = res._embedded.reasons;
    });

    this.registerForm = this.formBuilder.group({
      dni: [null, Validators.required],
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      company: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      reason: [null],
      project: [null]
    });
  }

  ngAfterViewInit() {
    // this.signaturePad is now available
    if (this.signaturePad != undefined) {
      this.signaturePad.set('canvasHeight', this.signaturePad.elementRef.nativeElement.parentElement.offsetHeight);
      this.signaturePad.set('canvasWidth', this.signaturePad.elementRef.nativeElement.parentElement.offsetWidth);

      //this.signaturePad.set('minWidth', 1); // set szimek/signature_pad options at runtime
      this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
    }
  }

  drawComplete() {
    //console.log(this.signaturePad.toDataURL());
  }

  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('begin drawing');
  }

  clearSignature() {
    this.signaturePad.clear();
  }

  hasFormError(formName: string) {
    let element = this.registerForm.get(formName);
    return element.touched && element.invalid && (element.value == null || element.value == '');
  }

  getUserByDni() {
    let value = this.registerForm.get('dni').value;
    if (value.length >= 5) {
      this.userService.getUserByDni(value).subscribe((res: any) => {
        if (res != 500) {
          this.registerForm.get('firstname').setValue(res.firstname);
          this.registerForm.get('lastname').setValue(res.lastname);
          this.registerForm.get('email').setValue(res.email);
          this.registerForm.get('company').setValue(res.company);

          this.registerForm.get('firstname').disable();
          this.registerForm.get('lastname').disable();
          this.registerForm.get('email').disable();
          this.registerForm.get('company').disable();

          /* Get activated projects where the user is participant */
          this.userService.getData(res._links.reasonProjectParticipant.href).subscribe((resProject: any) => {
            let projectParticipant = resProject._embedded.reasonProjectParticipants;
            let reasonProjectReq = [];

            // To show the project selector
            projectParticipant.forEach(element => {
              reasonProjectReq.push(this.userService.getData(element._links.reason.href));
              this.hasProjects = true;
            });


            this.visitService.getCurrentVisitUser(value).subscribe((res: any) => {
              if (res != 500) {
                this.registerForm.get('project').disable();
                this.registerForm.get('reason').disable();
                this.visitService.getData(res._links.reason.href).subscribe((resReason: Reason) => {
                  // Change button style
                  this.buttonTitle = this.translate.instant('visit.markexit');
                  this.registerButton.nativeElement.classList.remove('btn-gradient-primary');
                  this.registerButton.nativeElement.classList.add('btn-gradient-danger');

                  // Set value
                  if (resReason.isproject) {
                    this.registerForm.get('project').setValue(resReason._links.self.href);
                    this.registerForm.get('reason').setValue(null);
                  } else {
                    this.registerForm.get('reason').setValue(resReason._links.self.href);
                    this.registerForm.get('project').setValue(null);
                  }
                });
              }
            });

            forkJoin(reasonProjectReq).subscribe((resProjectRes: any) => {
              this.projectList = resProjectRes.filter((p: Reason) => p.finished == false);
              this.registerForm.get('project').setValue(null);
            });
          }, (error) => {
            this.hasProjects = false;
          });

          // Get the user signature
          this.userService.getUserSignature(res._links.self.href).subscribe((res: any) => {
            if (res == null) {
              this.loadSignature = true;
              this.signaturePad != undefined ? this.signaturePad.clear() : "";
              this.userSignature = new Image();
            } else {
              this.loadSignature = false;
            }
            this.userSignature.src = res;
            this.userSignature.width = 200;
            this.userSignature.height = 200;
          });
        } else {
          this.clearAndEnableForm();
        }

      });
    } else {
      this.clearAndEnableForm();
      this.hasProjects = false;
    }
  }

  submit() {
    if (this.signaturePad != undefined && this.signaturePad.isEmpty()) {
      this.signatureDiv.nativeElement.style["border-color"] = "red";
      return;
    }

    let user: User = new User();
    user.dni = this.registerForm.get('dni').value;
    user.firstname = this.registerForm.get('firstname').value;
    user.lastname = this.registerForm.get('lastname').value;
    user.email = this.registerForm.get('email').value;
    user.company = this.registerForm.get('company').value;
    user.roles = "VISITOR";
    user.signature = this.signaturePad != null ? this.signaturePad.toDataURL() : null;
    let reason = this.registerForm.get('reason').value;
    let project = this.registerForm.get('project').value;

    // Check if the user is actually in plant
    this.visitService.getCurrentVisitUser(user.dni).subscribe((res: any) => {
      if (res == 500) { // If User Is not in plant
        this.visitService.saveVisit(user).subscribe(
          (res: any) => {
            this.visitService.assignVisitToReason(res.uuid, (project != null ? project : reason)).subscribe(finalres => {
              this.registerForm.get('dni').setValue(null);
              this.projectList = [];
              this.hasProjects = false;
              this.signaturePad != undefined ? this.signaturePad.clear() : "";
              this.openSaveModal(res);
            })
          },
          error => {
            this.alertService.error(`Error ${error.error}`);
          });
      } else {
        // If user is in plant mark exit
        if (project != null) {
          this.openConfirmationModal(res, true);
        } else {
          this.openConfirmationModal(res, false);
        }
      }
    });


  }

  private clearAndEnableForm() {
    this.registerForm.get('firstname').setValue(null);
    this.registerForm.get('lastname').setValue(null);
    this.registerForm.get('company').setValue(null);
    this.registerForm.get('email').setValue(null);
    this.registerForm.get('reason').setValue(null);
    this.registerForm.get('project').setValue(null);

    this.registerForm.get('firstname').enable();
    this.registerForm.get('lastname').enable();
    this.registerForm.get('email').enable();
    this.registerForm.get('company').enable();
    this.registerForm.get('reason').enable();
    this.registerForm.get('project').enable();

    this.buttonTitle = this.translate.instant('register');
    this.registerButton.nativeElement.classList.remove('btn-gradient-danger');
    this.registerButton.nativeElement.classList.add('btn-gradient-primary');

    this.userSignature = new Image();
    this.loadSignature = true;
    this.projectList = null;
    this.signatureDiv != undefined ?
      this.signatureDiv.nativeElement.style["border-color"] = "#f2edf3" : "";
  }


  public openSaveModal(visit: Visit): void {
    const modalRef = this.modalService.open(RegisterVisitMessageComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.visit = visit;
    modalRef.componentInstance.name = this.registerForm.get('firstname').value + " " + this.registerForm.get('lastname').value;

    this.clearAndEnableForm();
    this.registerForm.reset();

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {

      });
  }

  public openConfirmationModal(visit: Visit, isProject: boolean): void {
    const modalRef = this.modalService.open(RegisterVisitConfirmationComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.visit = visit;
    modalRef.componentInstance.isProject = isProject;
    modalRef.componentInstance.name = this.registerForm.get('firstname').value + " " + this.registerForm.get('lastname').value;

    this.clearAndEnableForm();
    this.registerForm.reset();

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {

      });
  }
}
