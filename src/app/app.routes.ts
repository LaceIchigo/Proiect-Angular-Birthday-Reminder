import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'birthdays',
        canActivate: [authGuard],
        loadComponent: () => import('./features/birthday-reminder/birthday-reminder.component').then(m => m.BirthdayReminderComponent)
    },
    // Adăugați această rută catch-all la final
    {
        path: '**',
        redirectTo: 'login'
    }
];