import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { EpiService } from 'src/app/core/services/epi.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Epi } from 'src/app/shared/models/epi.model';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { Reason } from 'src/app/shared/models/reason.model';
import { Visit } from 'src/app/shared/models/visit.model';


@Component({
  selector: 'infini-visit-epis',
  templateUrl: './visit-epis.component.html'
})
export class VisitEpisComponent implements OnInit {

  visitForm: FormGroup;
  modalTitle: string = this.translateService.instant('visit.editvisittitle');
  editionMode: boolean = false;
  @Input() public visitUuid;
  associationtitle: string = this.translateService.instant('reason.associatetozone');

  epiList: Epi[];
  epis: string;
  authorizevisit: boolean = false;
  loadSignature: boolean = true;
  userSignature: any = new Image();
  @ViewChild('signaturePadC') signaturePad: any;
  @ViewChild('signatureDiv') signatureDiv: any;
  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 0.5,
    'canvasWidth': 1200,
    'penColor': 'black',
    'canvasHeight': 300
  };

  constructor(
    private formBuilder: FormBuilder,
    private visitService: VisitService,
    private epiService: EpiService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    /* Load epis */
    this.epiService.getEpis().subscribe((res: any) => {
      this.epiList = res._embedded.epis;
    });

    this.visitForm = this.formBuilder.group({
      dni: [null, Validators.required],
      firstname: [null, Validators.required],
      lastname: [null, Validators.required]
    });

    if (this.visitUuid != null) {
      this.editionMode = true;
      this.visitService.getVisit(this.visitUuid).subscribe((res: Visit) => {
        if (res != undefined) {
          this.epis = res.epis;
          this.visitForm.get('dni').setValue(res.dni);
          this.visitForm.get('firstname').setValue(res.firstname);
          this.visitForm.get('lastname').setValue(res.lastname);
          if (res.dni != null) this.visitForm.get('dni').disable();
          if (res.firstname != null) this.visitForm.get('firstname').disable();
          if (res.lastname != null) this.visitForm.get('lastname').disable();
          if(res.signature != null){
            this.visitService.getAuthorizationSignature(res._links.self.href).subscribe((res: any) => {
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
          }
        }

      });
    }
  }

  ngAfterViewChecked() {
    this.markEpisCheckbox();
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

  submit() {
    let visit = new Visit();
    visit.uuid = this.visitUuid;
    visit.epis = this.getEpisChecked();
    visit.firstname = this.visitForm.get('firstname').value;
    visit.lastname = this.visitForm.get('lastname').value;
    visit.dni = this.visitForm.get('dni').value;
    visit.signature = this.signaturePad != null ? this.signaturePad.toDataURL() : null;

    this.visitService.updateVisit(visit).subscribe((res: any) => {
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success("Visita actualizada correctamente", options);
      this.closeModal();
    })
  }

  getEpisChecked() {
    let episInput = document.getElementsByClassName('form-check-input');
    let epis = "";
    if (episInput != undefined) {
      for (let i = 0; i < episInput.length; i++) {
        let checkbox: any = episInput[i];
        if (checkbox.checked) {
          epis += checkbox.id + ",";
        }
      }
    }
    if (epis.length > 1) {
      epis = epis.substr(0, epis.length - 1);
    }
    return epis;
  }

  markEpisCheckbox() {
    let episInput = document.getElementsByClassName('form-check-input');
    if (episInput != undefined) {
      let episList = this.epis != null && this.epis.length > 0 ? this.epis.split(',') : [];
      for (let i = 0; i < episInput.length; i++) {
        let checkbox: any = episInput[i];
        if (episList.includes(checkbox.id)) {
          checkbox.checked = true;
        }
      }
    }
  }

  clearSignature() {
    this.signaturePad.clear();
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

