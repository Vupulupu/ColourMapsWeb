import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { DrawingComponent } from './drawing/drawing.component';
import { ManageComponent } from "./manage/manage.component";

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'home', redirectTo: '', pathMatch: 'full'},
	{ path: 'about', component: AboutComponent },
	{ path: 'drawing', component: DrawingComponent },
  { path: 'manage', component: ManageComponent },
	{ path: '**', redirectTo: '', pathMatch: 'full'}
];
