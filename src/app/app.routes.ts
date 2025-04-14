import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { DrawingComponent } from './drawing/drawing.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'home', redirectTo: '', pathMatch: 'full'},
	{ path: 'about', component: AboutComponent },
	{ path: 'drawing', component: DrawingComponent },
	{ path: '**', redirectTo: '', pathMatch: 'full'}
];
