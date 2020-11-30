import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { Visit } from 'src/app/shared/models/visit.model';

@Component({
  selector: 'infini-visit-external',
  templateUrl: './visit-external.component.html',
  styleUrls: ['./visit-external.component.scss']
})
export class VisitExternalComponent implements OnInit {

  @ViewChild('optionFilter') optionFilter: any;
  reasonForm: FormGroup;
  data: Visit[];
  optionList: any = [
    { name: "Visitas de hoy", value: "t" },
    { name: "Visitas de la semana", value: "w" },
    { name: "Visitas del mes", value: "m" },
    { name: "Visitas sin terminar", value: "p" }
  ];
  optionValue: string = this.optionList[0].value;
  /* Table Settings */
  settings = {
    columns: {
      user: {
        title: this.translateService.instant('visit.person'),
        valuePrepareFunction: (data) => {
          if (data != null) {
            return `${data?.firstname} ${data?.lastname}`;
          }
        }
      },
      reason: {
        title: this.translateService.instant('visit.reason'),
        valuePrepareFunction: (data) => {
          if (data != null) {
            return `${data?.name}`;
          }
        }
      },
      startDate: {
        title: this.translateService.instant('visit.startdate'),
        type: 'date',
        valuePrepareFunction: (data) => {
          if (data != null) {
            return this.datePipe.transform(data, 'dd/MM/yyyy HH:mm');
          }
        }
      }, endDate: {
        title: this.translateService.instant('visit.enddate'),
        valuePrepareFunction: (data) => {
          if (data != null) {
            return this.datePipe.transform(data, 'dd/MM/yyyy HH:mm');
          }
        }
      }
    },
    actions: {
      columnTitle: this.translateService.instant('actions'),
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'update', title: '<i class="mdi mdi-exit-to-app"></i>' },
      ],
      position: 'right'
    },
    attr: {
      class: 'table table-bordered'
    },
    rowClassFunction: (row) => {
      // row css
    },
    pager: {
      display: true,
      perPage: 10
    }
  };

  constructor(private formBuilder: FormBuilder,
    private visitService: VisitService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private translateService: TranslateService
  ) { }

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
    this.visitService.getVisits(filter).subscribe((res: Visit[]) => {
      this.data = res.filter((f: Visit) => {
        let today = new Date();
        let [start, end] = this.getWeekDates();
        let month = today.getMonth();
        let day = today.getDate();
        let dateVisit = new Date(f.startDate);
        if (filter == 't' && dateVisit.getDate() == day) {
          return f;
        } else if (filter == 'w' && ((dateVisit.getDate() >= start.getDate() && dateVisit.getDate() <= end.getDate()) || (dateVisit.getDate() >= start.getDate() && dateVisit.getMonth() < end.getMonth()))) {
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

  updateVisit(visit: any) {
    this.visitService.updateVisit(visit).subscribe((res: any) => {
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success("Salida marcada correctamente", options);
      this.refreshList();
    });
  }

  onCustomAction(event) {
    switch (event.action) {
      case 'update':
        this.updateVisit(event.data);
        break;
    }
  }
}
