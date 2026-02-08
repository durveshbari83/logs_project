import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
    showLoginModal = false;
    loginEmail = '';
    loginPassword = '';
    loginError = '';

    constructor(private router: Router) { }

    onLogin() {
        this.showLoginModal = true;
        this.loginError = '';
    }

    submitLogin() {
        const email = this.loginEmail.trim().toLowerCase();
        const password = this.loginPassword.trim();

        const isValidEmail = email === 'admin200@gamil.com' || email === 'admin200@gmail.com';
        const isValidPassword = password === 'admin@22';

        if (isValidEmail && isValidPassword) {
            this.closeModal();
            this.router.navigate(['/user']);
        } else {
            this.loginError = 'Invalid email or password. Please try again.';
        }
    }

    closeModal() {
        this.showLoginModal = false;
        this.loginEmail = '';
        this.loginPassword = '';
        this.loginError = '';
    }

    onAbout() {
        console.log('About button clicked');
        alert('This is a professional logs management project.');
    }
}
