import { Component } from '@angular/core';
import { SpotifyComponent } from '../spotify/spotify.component';
import { GithubDashboardComponent } from '../github-dashboard/github-dashboard';

@Component({
  selector: 'app-activity',
  imports: [SpotifyComponent, GithubDashboardComponent],
  templateUrl: './activity.html',
  styleUrl: './activity.css'
})
export class ActivityComponent {
}
