import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // For [(ngModel)]

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  token: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.http.post<any>('https://alumniapi20250607211620.azurewebsites.net/api/account/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: res => {
        this.token = res.token;
        localStorage.setItem('token', this.token);
        this.router.navigate(['/graduates']);
      },
      error: err =>{   debugger; alert('Login failed')}
    });
  }
}
