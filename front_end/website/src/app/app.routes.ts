import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home/home-page/home-page.component';
import { UserComponent } from './components/user/user.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'user', component: UserComponent },
    { path: '**', redirectTo: '' }
];
