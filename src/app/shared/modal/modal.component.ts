import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html'
})
export class ModalComponent implements OnInit {

  @Input() title = 'Information';
  @Input() isLoading = false;


  constructor(
    public modalService: NgbModal
  ) { }

  ngOnInit() {

  }

}
