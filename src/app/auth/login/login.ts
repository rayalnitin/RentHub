import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  errorMessage = '';
  showPassword = false;

  private authService: AuthService;
  private router: Router;
  private route: ActivatedRoute;

  constructor(authService: AuthService, router: Router, route: ActivatedRoute) {
    this.authService = authService;
    this.router = router;
    this.route = route;
  }

  // Shortcuts so the HTML can say email.invalid instead of loginForm.controls.email.invalid
  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    // If the form has errors, show them all and stop
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // The value can be null in TypeScript's eyes, so we fall back to an empty string
    const email = this.loginForm.value.email || '';
    const password = this.loginForm.value.password || '';

    const result = this.authService.login(email, password);
    if (result.success === false) {
      this.errorMessage = result.message;
      return;
    }

    // Go back to the page the user originally wanted, or to the home page
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/listings']);
    }
  }
}
