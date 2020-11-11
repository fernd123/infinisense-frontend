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
  constructor(private formBuilder: FormBuilder,
    private reasonService: ReasonService,
    private alertService: AlertService,
    private modalService: NgbModal) { }

  ngOnInit() {

    this.refreshList();
    this.reasonForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      association: [null]
    });
  }

  refreshList() {
    this.reasonService.getReasons("").subscribe((res: Reason[]) => {
      debugger;
      this.reasonList = res;
    });
  }

  openModal(exampleModalContent) {
    this.modalService.open(exampleModalContent, { size: 'lg' });
  }

  submit() {
    let reason: Reason = new Reason();
    reason.name = this.reasonForm.get('name').value;
    reason.description = this.reasonForm.get('description').value;
    this.reasonService.saveReason(reason, "").subscribe(res => {
      this.refreshList();
      this.modalService.dismissAll();
      this.reasonForm.reset();
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success("¡Éxito!, motivo añadido correctamente", options);
    })
  }



}
