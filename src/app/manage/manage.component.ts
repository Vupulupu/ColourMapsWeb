
import { Component, Injectable, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import {RxFor} from "@rx-angular/template/for";

@Injectable({providedIn: 'root'})
@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, RxFor,],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent {
  private apiUrl: string = "https://www.cs.colostate.edu/~razbewwy/cs312/t22/api/";

  username: string = '';
  password: string = '';
  databaseName: string = '';

  isNewDatabase: boolean = false;
  colorsFetched: boolean = false;
  authenticateError: string = '';

  private http = inject(HttpClient);

  signIntoDatabase(): void {
}
}