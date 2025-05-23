import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    debugger;
    this.http.post('https://localhost:5001/api/account/register', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => {
        this.errorMessage = error.error?.error || 'Registration failed';
      }
    });
  }
}
