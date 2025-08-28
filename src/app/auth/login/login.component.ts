import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true, // ← Componentă standalone
    imports: [CommonModule, ReactiveFormsModule, RouterLink], // ← Importuri necesare
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const { email, password, rememberMe } = this.loginForm.value;

        this.authService.login(email, password, rememberMe).subscribe({
            next: () => {
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = err.error?.error || 'Login failed';
                this.isLoading = false;
            }
        });
    }
}