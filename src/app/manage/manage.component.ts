
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
  colors: Color[] = [];

  isNewDatabase: boolean = false;
  colorsFetched: boolean = false;
  authenticateError: string = '';

  private http = inject(HttpClient);

  signIntoDatabase(): void {
    const requestBody: { [key: string]: number | string | boolean } = {
      "username": this.username,
      "password": this.password,
      "database": this.databaseName,
    };
    if (this.isNewDatabase)
      requestBody["database-action"] = true;

    this.http.post<{[key: string]: {}[]}>(this.apiUrl, requestBody).subscribe({
      next: res => {
        console.log(res["colors"]);
        this.colors = res["colors"] as Color[];
        this.colorsFetched = true;
      },
      error: err => {
        console.error(err.error);
        this.authenticateError = err.error.error;
      }
    });
  }
}

interface Color {
  id: number;
  name: string;
  hex: string;
}