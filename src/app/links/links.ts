import { Component } from '@angular/core';
import { GithubDashboardComponent } from '../github-dashboard/github-dashboard';

@Component({
  selector: 'app-links',
  imports: [GithubDashboardComponent],
  templateUrl: './links.html',
  styleUrl: './links.css',
})
export class Links {}
