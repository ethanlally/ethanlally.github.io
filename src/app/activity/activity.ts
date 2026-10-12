import { Component } from '@angular/core';
import { SpotifyComponent } from '../spotify/spotify.component';
import { GithubDashboardComponent } from '../github-dashboard/github-dashboard';
import { ReadingComponent } from '../reading/reading';

@Component({
  selector: 'app-activity',
  imports: [SpotifyComponent, GithubDashboardComponent, ReadingComponent],
  templateUrl: './activity.html',
  styleUrl: './activity.css',
})
export class ActivityComponent {}
