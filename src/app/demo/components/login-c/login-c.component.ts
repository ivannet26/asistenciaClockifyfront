import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputGroupModule } from 'primeng/inputgroup';

@Component({
  selector: 'app-login-c',
  standalone: true,
  imports: [
    RouterModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    RippleModule,
    InputGroupModule
  ],
  templateUrl: './login-c.component.html',
  styleUrl: './login-c.component.css'
})
export class LoginCComponent {

  constructor(private router: Router) {

  }

  login2() {
    this.router.navigate(['/']);
  }

}
