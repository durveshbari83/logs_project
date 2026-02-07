import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../../sections/table/table.component';

@Component({
    selector: 'app-user',
    standalone: true,
    imports: [CommonModule, TableComponent],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
    isTablePopupOpen: boolean = false;
    isProfileMenuOpen: boolean = false;
    isSettingsOpen: boolean = false;
    isDarkMode: boolean = true;
    zoomLevel: number = 1.0;
    userName: string = 'Admin';
    totalLogs: number = 0;
    activePCs: number = 0;

    constructor(private router: Router, private http: HttpClient) { }

    ngOnInit(): void {
        this.fetchStats();
    }

    fetchStats(): void {
        this.http.get<{ total_logs: number, active_pcs: number }>('http://localhost:3005/api/stats')
            .subscribe({
                next: (data) => {
                    this.totalLogs = data.total_logs;
                    this.activePCs = data.active_pcs;
                },
                error: (err) => console.error('Error fetching stats:', err)
            });
    }

    getInitials(): string {
        if (!this.userName) return '??';
        const parts = this.userName.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    }

    toggleProfileMenu(event: Event): void {
        event.stopPropagation();
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
    }

    closeProfileMenu(): void {
        this.isProfileMenuOpen = false;
    }

    toggleSettings(event?: Event): void {
        if (event) event.stopPropagation();
        this.isSettingsOpen = !this.isSettingsOpen;
    }

    toggleTheme(): void {
        this.isDarkMode = !this.isDarkMode;
    }

    updateZoom(delta: number): void {
        const newZoom = this.zoomLevel + delta;
        if (newZoom >= 0.5 && newZoom <= 2.0) {
            this.zoomLevel = Math.round(newZoom * 10) / 10;
        }
    }

    resetZoom(): void {
        this.zoomLevel = 1.0;
    }

    toggleTablePopup(): void {
        this.isTablePopupOpen = !this.isTablePopupOpen;
    }

    logout(): void {
        this.router.navigate(['/']);
    }
}
