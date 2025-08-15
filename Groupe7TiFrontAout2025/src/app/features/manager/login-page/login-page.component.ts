import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {UserService} from '../../../services/user.service';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  username: string = 'admin';
  password: string = '';
  errorMessage: string = '';

  constructor(private userService: UserService,private router: Router) {}

  onLogin() {
    // Call the login method from the user service and subscribe to the result
    this.userService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Connection error', err);

        // Retrieve message sent by backend (if any)
        const backendMessage = err.error?.message || '';

        if (backendMessage === 'Invalid username') {
          this.errorMessage = 'The username or password is incorrect.';
        } else if (backendMessage === 'Invalid password') {
          this.errorMessage = 'The password or password is incorrect.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }

}
