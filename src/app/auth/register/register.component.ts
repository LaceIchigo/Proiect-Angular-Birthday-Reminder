import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    private passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
        } else {
            confirmPassword?.setErrors(null);
        }

        return null;
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const { email, password, firstName, lastName } = this.registerForm.value;
        const userData = { email, password, firstName, lastName };

        console.log('Attempting registration with:', userData);

        this.authService.register(userData).subscribe({
            next: (response) => {
                console.log('Registration response:', response);
                this.isLoading = false;
                this.router.navigate(['/login'], {
                    queryParams: { registered: true }
                });
            },
            error: (err) => {
                console.error('Registration error details:', err);
                this.errorMessage = err.message || 'Registration failed';
                this.isLoading = false;
            }
        });
    }
}