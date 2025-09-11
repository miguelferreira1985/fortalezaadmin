import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {};

  onSubmit(form: NgForm) {
    this.errorMessage = null;

    if (form.valid) {
      console.log('Formulario válido. Por favor, llena todos los campos.');
      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          // Store the tokens securely
          console.log(response);
          localStorage.setItem('accessToken', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
  
          // Navigate to the dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = 'Nombre de usuario o contraseña incorrectas. Por favor, intentalo de nuevo.'
          console.error('Login failed', error);
        }
      });
    }
  }

}
