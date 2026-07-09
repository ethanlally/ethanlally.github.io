import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-github-dashboard',
  imports: [AsyncPipe],
  templateUrl: './github-dashboard.html',
  styleUrl: './github-dashboard.css'
})
export class GithubDashboardComponent {
  http = inject(HttpClient);
  repos$ = this.http.get<any[]>('/api/github').pipe(
    catchError(() => this.http.get<any[]>('https://api.github.com/users/ethanlally/repos?sort=updated&per_page=5'))
  );
}
