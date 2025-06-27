import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="register-container retro-card">
      <h2>REGISTER</h2>
      
      <div *ngIf="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
      <form (ngSubmit)="onRegister()" #registerForm="ngForm">
        <div class="form-group">
          <label for="username" class="form-label">USERNAME</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            [(ngModel)]="userData.username" 
            class="form-input" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">EMAIL</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            [(ngModel)]="userData.email" 
            class="form-input" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">PASSWORD</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            [(ngModel)]="userData.password" 
            class="form-input" 
            required
            minlength="6"
          >
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'LOADING' : 'REGISTER' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="showLogin = true">
            LOGIN
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .register-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
    
    .form-actions .btn {
      flex: 1;
    }
  `]
})
export class RegisterComponent {
    userData: RegisterRequest = { username: '', email: '', password: '' };
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    showLogin = false;

    constructor(private authService: AuthService) { }

    onRegister(): void {
        if (!this.userData.username || !this.userData.email || !this.userData.password) {
            this.errorMessage = 'PLEASE FILL IN ALL FIELDS';
            return;
        }

        if (this.userData.password.length < 6) {
            this.errorMessage = 'PASSWORD MUST BE AT LEAST 6 CHARACTERS';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.register(this.userData).subscribe({
            next: (response) => {
                this.successMessage = 'REGISTRATION SUCCESSFUL!';
                this.isLoading = false;
                console.log('Registration response:', response);
            },
            error: (error) => {
                this.errorMessage = error.error?.error || 'REGISTRATION FAILED';
                this.isLoading = false;
                console.error('Registration error:', error);
            }
        });
    }
} 