import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {NgIf} from '@angular/common';
import {UserService} from '../login-page/user.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})

export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token!: string;
  successMessage = '';
  errorMessage = '';

  // Tracks which password rules are satisfied
  passwordCriteria = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  };

  allCriteriaValid = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Get token from URL query parameters
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    // Create password form with validation rules
    this.resetForm = this.fb.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$')
        ]
      ]
    });

    // Listen to password input changes and update criteria flags
    this.resetForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.passwordCriteria.minLength = value?.length >= 8;
      this.passwordCriteria.uppercase = /[A-Z]/.test(value);
      this.passwordCriteria.lowercase = /[a-z]/.test(value);
      this.passwordCriteria.number = /\d/.test(value);
      this.passwordCriteria.specialChar = /[@$!%*?&]/.test(value);

      this.allCriteriaValid = Object.values(this.passwordCriteria).every(Boolean);
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    const newPassword = this.resetForm.value.newPassword;

    // Send new password and token to backend
    this.userService.resetPassword({token : this.token, newPassword : newPassword}).subscribe({
      next: () => {
        this.successMessage = 'Password updated successfully.';
        this.router.navigate(['/login']);
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Error during password reset.';
      }
    })
  }
}
