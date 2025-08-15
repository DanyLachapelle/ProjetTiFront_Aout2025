import { Component } from '@angular/core';
import {UserService} from '../login-page/user.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  error = '';

  constructor(private userService: UserService) {}

  onSubmit() {
    this.userService.forgotPassword({email: this.email}).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.error = '';
      },
      error: (err) => {
        this.error = 'Error sending email.';
        this.message = '';
      }
    });
  }
}
