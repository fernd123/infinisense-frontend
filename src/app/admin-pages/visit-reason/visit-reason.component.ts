import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { Reason } from 'src/app/shared/models/reason.model';

@Component({
  selector: 'infini-visit-reason',
  templateUrl: './visit-reason.component.html',
  styleUrls: ['./visit-reason.component.scss']
})
export class VisitReasonComponent implements OnInit {

  reasonForm: FormGroup;
  reasonList: Reason[];
  @ViewChild('modalWindow') modalWindow: any;
  editionMode: boolean = false;
  reasonEditUuid: string;
  constructor(private formBuilder: FormBuilder,
    private reasonService: ReasonService,
    private alertService: AlertService,
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
    this.reasonService.getReasons("").subscribe((res: Reason[]) => {
      this.reasonList = res;
    });
  }

  openModal(exampleModalContent, reason?: Reason) {
    if (reason != null) {
      this.editionMode = true;
      this.reasonEditUuid = reason.uuid;
      this.reasonForm.get('name').setValue(reason.name);
      this.reasonForm.get('description').setValue(reason.description);
      this.reasonForm.get('active').setValue(reason.active);
    }
    this.modalService.open(exampleModalContent); //{ size: 'lg' }
  }

  submit() {
    let reason: Reason = new Reason();
    reason.name = this.reasonForm.get('name').value;
    reason.description = this.reasonForm.get('description').value;
    reason.active = this.reasonForm.get('active').value;

    if(!this.editionMode){
      this.reasonService.saveReason(reason, "").subscribe(res => {
        this.refreshList();
        this.modalService.dismissAll();
        this.reasonForm.reset();
        let options = {
          autoClose: true,
          keepAfterRouteChange: true
        };
        this.alertService.success("¡Éxito!, motivo añadido correctamente", options);
      });
    }else{
      reason.uuid = this.reasonEditUuid;
      this.reasonService.updateReason(reason, "").subscribe(res => {
        this.refreshList();
        this.modalService.dismissAll();
        this.reasonForm.reset();
        let options = {
          autoClose: true,
          keepAfterRouteChange: true
        };
        this.reasonEditUuid = null;
        this.editionMode = false;
        this.alertService.success("¡Éxito!, motivo actualizado correctamente", options);
      });
    }
  }



}
