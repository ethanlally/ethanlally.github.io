import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CursorTrail } from './cursor-trail/cursor-trail';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CursorTrail],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);

  protected readonly title = signal('ethan');
  protected readonly showSiteChrome = signal(true);

  constructor() {
    this.updateSiteChrome(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.updateSiteChrome(event.urlAfterRedirects));
  }

  private updateSiteChrome(url: string): void {
    const pathname = url.split('?')[0].split('#')[0].replace(/\/+$/, '');
    this.showSiteChrome.set(pathname !== '/annika');
  }
}
