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
      padding: 2.5rem 2rem;
      background: #e0ddc7;
      border: 3px solid var(--paper-dark);
      box-shadow: 8px 8px 20px var(--paper-shadow);
      border-radius: 0;
    }
    h2 {
      text-align: center;
      color: var(--paper-black);
      font-family: 'Press Start 2P', monospace;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-label {
      display: block;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 0.8rem;
      color: var(--paper-black);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem;
      font-family: 'VT323', 'Courier New', monospace;
      font-size: 1.1rem;
      background: #f0efe2;
      border: 3px solid var(--paper-dark);
      color: var(--paper-black);
      box-shadow: inset 2px 2px 4px var(--paper-shadow);
      border-radius: 4px;
      transition: background 0.2s, border-color 0.2s;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--paper-black);
      background: #e6e3c6;
      box-shadow: 0 0 0 2px var(--highlight), inset 2px 2px 4px var(--paper-shadow);
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
    .form-actions .btn {
      flex: 1;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.9rem;
      padding: 0.8rem 1.2rem;
      border-radius: 4px;
      border: 2px solid var(--paper-dark);
      background: linear-gradient(145deg, var(--paper-medium), var(--paper-light));
      color: var(--paper-black);
      box-shadow: 2px 2px 6px var(--paper-shadow);
      transition: all 0.2s;
      cursor: pointer;
    }
    .form-actions .btn.btn-primary {
      background: linear-gradient(145deg, var(--paper-dark), var(--paper-medium));
      color: var(--paper-white);
      border: 2px solid var(--paper-black);
    }
    .form-actions .btn.btn-primary:hover {
      background: linear-gradient(145deg, var(--paper-black), var(--paper-darker));
      color: var(--paper-white);
    }
    .form-actions .btn.btn-secondary {
      background: linear-gradient(145deg, var(--paper-light), var(--paper-white));
      color: var(--paper-black);
      border: 2px solid var(--paper-dark);
    }
    .form-actions .btn.btn-secondary:hover {
      background: var(--highlight);
      color: var(--paper-black);
    }
    .message {
      padding: 1rem;
      margin: 1rem 0;
      font-family: 'VT323', 'Courier New', monospace;
      font-size: 1.1rem;
      border: 3px solid;
      text-align: center;
      border-radius: 6px;
    }
    .message.error {
      background: var(--error);
      border-color: var(--error-border);
      color: #b22222;
    }
    .message.success {
      background: #eaffea;
      border-color: #22b222;
      color: #228B22;
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