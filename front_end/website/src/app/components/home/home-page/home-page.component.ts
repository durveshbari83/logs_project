import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
    onLogin() {
        console.log('Login button clicked');
        alert('Login feature coming soon!');
    }

    onAbout() {
        console.log('About button clicked');
        alert('This is a professional logs management project.');
    }
}
