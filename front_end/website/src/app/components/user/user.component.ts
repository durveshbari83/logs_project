import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableComponent } from '../../sections/table/table.component';

@Component({
    selector: 'app-user',
    standalone: true,
    imports: [CommonModule, TableComponent],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserComponent {
    constructor(private router: Router) { }

    logout(): void {
        this.router.navigate(['/']);
    }
}
