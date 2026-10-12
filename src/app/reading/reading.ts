import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, Subscription, switchMap, timer } from 'rxjs';

interface ReadingData {
  book: {
    title: string;
    author: string;
    coverUrl: string | null;
    bookUrl: string;
  } | null;
  updatedAt?: number | null;
  stale?: boolean;
  error?: string;
}

@Component({
  selector: 'app-reading',
  templateUrl: './reading.html',
  styleUrl: './reading.css',
})
export class ReadingComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private subscription?: Subscription;
  readonly isWorkerHosted = ['lally.lol', 'localhost', '127.0.0.1', '[::1]'].includes(
    globalThis.location.hostname,
  );
  readonly data = signal<ReadingData | null>(null);
  readonly failedCover = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.isWorkerHosted) return;
    this.subscription = timer(0, 60 * 60 * 1000)
      .pipe(
        switchMap(() =>
          this.http
            .get<ReadingData>('/api/reading')
            .pipe(
              catchError(() =>
                of<ReadingData>({
                  book: null,
                  error: 'Reading updates are temporarily unavailable.',
                }),
              ),
            ),
        ),
      )
      .subscribe((data) => this.data.set(data));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
