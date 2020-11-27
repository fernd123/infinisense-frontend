import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'inf-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css']
})
export class LoginAdminComponent {

  loginForm: FormGroup;
  error: boolean;
  user: any = {
    username: null,
    password: null
  };
  loading: boolean;
  redirectURL: string;
  loggedIn = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.authService.logout();
    this.loginForm = this.formBuilder.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
      tenantId: [null, Validators.required],
    });
  }


  login() {
    let username = this.loginForm.get('username').value;
    let password = this.loginForm.get('password').value;
    let tenantId = this.loginForm.get('tenantId').value;
    this.loading = true;
    this.authService.login(username, password, tenantId).subscribe(
      (res: any) => {
        this.loading = false;
        this.loggedIn = true;
        if (this.redirectURL) {
          this.router.navigateByUrl(this.redirectURL);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }, error => {
        this.loading = false;
        this.error = true;
      })
  }
  resetPassword(){}
}