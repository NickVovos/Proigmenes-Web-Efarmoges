import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { RegisterComponent } from '../pages/register/register.component';
import { NewGraduateComponent } from '../pages/new-graduate/new-graduate.component';
import { GraduateDashboardComponent } from '../pages/graduate-dashboard/graduate-dashboard.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'graduates/new', component: NewGraduateComponent },
  { path: 'graduates', component: GraduateDashboardComponent }
];
