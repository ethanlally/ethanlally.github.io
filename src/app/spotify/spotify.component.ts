import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, timer, switchMap, Subscription } from 'rxjs';

interface SpotifyData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  error?: string;
  progress_ms?: number;
  duration_ms?: number;
  fetchedAt?: number;
}

@Component({
  selector: 'app-spotify',
  imports: [],
  templateUrl: './spotify.component.html',
  styleUrl: './spotify.component.css'
})
export class SpotifyComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);
  
  data: SpotifyData | null = null;
  currentProgress = 0;
  
  private sub?: Subscription;
  private tickInterval: any;

  ngOnInit() {
    this.sub = timer(0, 15000).pipe(
      switchMap(() => this.http.get<SpotifyData>(`/api/spotify?bust=${Date.now()}`).pipe(
        catchError((err: any) => of({ isPlaying: false, error: err.message } as SpotifyData))
      ))
    ).subscribe((res: SpotifyData) => {
      this.data = res;
      if (res.isPlaying && res.progress_ms !== undefined && res.fetchedAt) {
        this.currentProgress = res.progress_ms + (Date.now() - res.fetchedAt);
      }
      this.cdr.markForCheck();
    });

    this.tickInterval = setInterval(() => {
      if (this.data?.isPlaying && this.data.duration_ms) {
        this.currentProgress += 1000;
        if (this.currentProgress > this.data.duration_ms) {
          this.currentProgress = this.data.duration_ms;
        }
        this.cdr.markForCheck();
      }
    }, 1000);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    clearInterval(this.tickInterval);
  }
}
