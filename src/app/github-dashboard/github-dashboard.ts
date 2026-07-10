import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { catchError, of } from 'rxjs';

const githubReposUrl = 'https://api.github.com/users/ethanlally/repos?sort=updated&per_page=5';

@Component({
  selector: 'app-github-dashboard',
  imports: [AsyncPipe],
  templateUrl: './github-dashboard.html',
  styleUrl: './github-dashboard.css'
})
export class GithubDashboardComponent {
  http = inject(HttpClient);
  private readonly isWorkerHosted = globalThis.location.hostname === 'lally.lol';
  repos$ = this.http.get<any[]>(this.isWorkerHosted ? '/api/github' : githubReposUrl).pipe(
    catchError(() => this.isWorkerHosted ? this.http.get<any[]>(githubReposUrl) : of([]))
  );
}
