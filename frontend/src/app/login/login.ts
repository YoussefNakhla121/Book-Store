import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  errorMessage: string = '';

  constructor(private authService: Auth, private router: Router) {}

  onLogin(form: NgForm) {
    if (form.valid) {
      const { email, password } = form.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login success', response);
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          console.log('Login failed', err);
          this.errorMessage = 'Email or password is incorrect';
        }
      });

    } else {
      console.log('some thing is wrong or you do not have account');
    }
  }
}