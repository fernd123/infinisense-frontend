import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { Visit } from 'src/app/shared/models/visit.model';

@Component({
  selector: 'infini-visit-external',
  templateUrl: './visit-external.component.html',
  styleUrls: ['./visit-external.component.scss']
})
export class VisitExternalComponent implements OnInit {

  reasonForm: FormGroup;
  visitList: Visit[];
  optionList: any = [
    { name: "Visitas de hoy", value: "t" },
    { name: "Visitas de la semana", value: "w" },
    { name: "Visitas del mes", value: "m" },
    { name: "Visitas sin terminar", value: "p" }
  ];
  @ViewChild('optionFilter') optionFilter: any;
  optionValue: string = this.optionList[0].value;
  constructor(private formBuilder: FormBuilder,
    private visitService: VisitService,
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
    let filter = this.optionList[0].value; // default
    filter = this.optionFilter != null ? this.optionList[this.optionFilter.nativeElement.selectedIndex].value : filter;
    this.visitService.getVisits("a", filter).subscribe((res: Visit[]) => {
      this.visitList = res.filter((f: Visit) => {
        let today = new Date();
        let [start, end] = this.getWeekDates();
        let month = today.getMonth();
        let day = today.getDay();
        let dateVisit = new Date(f.startDate);

        if (filter == 't' && dateVisit.getDay() == day) {
          return f;
        } else if (filter == 'w' && dateVisit.getDate() >= start.getDate() && dateVisit.getDate() <= end.getDate()) {
          return f;
        } else if (filter == 'm' && dateVisit.getMonth() == month) {
          return f;
        } else if (filter == 'p' && f.endDate == null) {
          return f;
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

  updateVisit(cosa: any) {
    this.visitService.updateVisit(cosa, "").subscribe((res: any) => {
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success("Salida marcada correctamente", options);
      this.refreshList();
    });
  }
}
