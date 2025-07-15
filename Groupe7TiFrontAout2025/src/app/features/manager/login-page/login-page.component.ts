import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {UserService} from './user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  login: string = '';
  mot_passe: string = '';
  errorMessage: string = '';

  constructor(private userService: UserService,private router: Router) {}

  onLogin() {
    this.userService.login({ login: this.login, mot_passe: this.mot_passe }).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.token);
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erreur de connexion', err);

        // Récupère le message envoyé par le backend
        const backendMessage = err.error?.message || '';

        if (backendMessage === 'Invalid pseudo') {
          this.errorMessage = 'The username is incorrect.';
        } else if (backendMessage === 'Invalid password') {
          this.errorMessage = 'The password is incorrect.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }

}
