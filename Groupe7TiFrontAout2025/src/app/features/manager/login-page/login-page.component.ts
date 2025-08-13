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
    console.log('Tentative de connexion avec:', { username: this.username, password: this.password });

    this.userService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);
        localStorage.setItem('token', response.token);
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
