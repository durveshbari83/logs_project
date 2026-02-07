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
    summaryList: string[] = [];
    searchQuery: string = '';
    selectedDeviceId: string | null = null;
    isDetailView: boolean = false;

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.fetchUniquePCs();
        }
    }

    fetchUniquePCs(): void {
        if (this.http) {
            this.http.get<string[]>('http://localhost:3005/api/unique-pcs')
                .subscribe({
                    next: (data) => {
                        this.summaryList = data;
                        console.log('Unique PCs fetched successfully');
                    },
                    error: (err) => console.error('Error fetching unique PCs:', err)
                });
        }
    }

    fetchLogs(): void {
        if (this.http && this.selectedDeviceId) {
            this.http.get<Log[]>(`http://localhost:3005/api/logs?device_id=${this.selectedDeviceId}`)
                .subscribe({
                    next: (data) => {
                        this.logs = data;
                        console.log('Logs fetched successfully');
                    },
                    error: (err) => console.error('Error fetching logs:', err)
                });
        }
    }

    selectPC(deviceId: string): void {
        this.selectedDeviceId = deviceId;
        this.isDetailView = true;
        this.fetchLogs();
    }

    clearPCFilter(): void {
        this.selectedDeviceId = null;
        this.isDetailView = false;
        this.logs = [];
        this.fetchUniquePCs();
    }
}
