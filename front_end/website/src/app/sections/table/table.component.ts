import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Log {
    id: number;
    device_id: string;
    app_name: string;
    event_type: string;
    timestamp: string;
}

@Component({
    selector: 'app-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
    private platformId = inject(PLATFORM_ID);
    private http = inject(HttpClient);

    logs: Log[] = [];
    searchQuery: string = '';

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.fetchLogs();
        }
    }

    fetchLogs(): void {
        if (this.http) {
            this.http.get<Log[]>('http://localhost:3000/api/logs')
                .subscribe({
                    next: (data) => {
                        this.logs = data;
                        console.log('Logs fetched successfully');
                    },
                    error: (err) => {
                        console.error('Error fetching logs:', err);
                    }
                });
        }
    }
}
