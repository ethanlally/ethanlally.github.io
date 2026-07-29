import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-cursor-trail',
  templateUrl: './cursor-trail.html',
  styleUrl: './cursor-trail.css',
})
export class CursorTrail implements AfterViewInit, OnDestroy {
  @ViewChildren('cursorPiece') private cursorPieces!: QueryList<ElementRef<HTMLElement>>;

  protected readonly cursorIndexes = Array.from({ length: 10 }, (_, index) => index);

  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly opacities = [1, 0.88, 0.78, 0.68, 0.58, 0.48, 0.38, 0.29, 0.21, 0.14];
  private readonly cloneDelay = 22;
  private readonly maximumCloneGap = 24;
  private readonly positions = this.cursorIndexes.map(() => ({ x: -40, y: -40 }));

  private mediaQuery?: MediaQueryList;
  private pieces: HTMLElement[] = [];
  private history: Array<{ x: number; y: number; time: number }> = [];
  private animationFrame: number | null = null;
  private lastFrameTime = 0;
  private lastMoveTime = 0;
  private pointerX = -40;
  private pointerY = -40;
  private enabled = false;
  private visible = false;
  private interactive = false;

  ngAfterViewInit(): void {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    this.pieces = this.cursorPieces.map((piece) => piece.nativeElement);
    this.mediaQuery = window.matchMedia(
      '(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)',
    );
    this.mediaQuery.addEventListener('change', this.handleMediaChange);
    this.syncEnabledState();
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.handleMediaChange);
    this.disable();
  }

  private readonly handleMediaChange = (): void => {
    this.syncEnabledState();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const now = performance.now();
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;

    if (!this.visible || now - this.lastMoveTime > 1100) {
      this.history = [{ x: this.pointerX, y: this.pointerY, time: now }];
      this.positions.forEach((position) => {
        position.x = this.pointerX;
        position.y = this.pointerY;
      });
      this.lastFrameTime = now;
      this.visible = true;
      this.element.nativeElement.classList.add('is-visible');
    } else {
      this.addHistoryPoint(this.pointerX, this.pointerY, now);
    }

    this.lastMoveTime = now;

    const target = event.target;
    const isInteractive =
      target instanceof Element &&
      target.closest('a, button, input, textarea, select, summary, [role="button"]') !== null;

    if (isInteractive !== this.interactive) {
      this.interactive = isInteractive;
      this.element.nativeElement.classList.toggle('is-interactive', isInteractive);
    }

    this.requestRender();
  };

  private readonly handlePointerDown = (): void => {
    this.element.nativeElement.classList.add('is-pressed');
  };

  private readonly handlePointerUp = (): void => {
    this.element.nativeElement.classList.remove('is-pressed');
  };

  private readonly handlePointerLeave = (): void => {
    this.visible = false;
    this.element.nativeElement.classList.remove('is-visible', 'is-pressed');
  };

  private readonly render = (): void => {
    this.animationFrame = null;
    const now = performance.now();
    const elapsed =
      this.lastFrameTime > 0 ? Math.min((now - this.lastFrameTime) / 1000, 0.05) : 1 / 60;
    const smoothing = 1 - Math.exp(-36 * elapsed);
    const idleTime = now - this.lastMoveTime;
    this.lastFrameTime = now;

    let trailVisible = false;
    let stillMoving = false;

    for (let index = 0; index < this.pieces.length; index += 1) {
      const position = this.positions[index];

      if (index === 0) {
        position.x = this.pointerX;
        position.y = this.pointerY;
        this.pieces[index].style.opacity = '1';
      } else {
        const target = this.getHistoryPoint(now - this.cloneDelay * index);
        const deltaX = target.x - position.x;
        const deltaY = target.y - position.y;
        const fadeStart = 120 + index * 45;
        const fade = Math.max(0, Math.min(1, (fadeStart + 650 - idleTime) / 650));

        position.x += deltaX * smoothing;
        position.y += deltaY * smoothing;

        const previous = this.positions[index - 1];
        const gapX = position.x - previous.x;
        const gapY = position.y - previous.y;
        const gap = Math.hypot(gapX, gapY);

        if (gap > this.maximumCloneGap) {
          const ratio = this.maximumCloneGap / gap;
          position.x = previous.x + gapX * ratio;
          position.y = previous.y + gapY * ratio;
        }

        this.pieces[index].style.opacity = String(this.opacities[index] * fade);
        trailVisible ||= fade > 0;
        stillMoving ||= Math.abs(deltaX) > 0.05 || Math.abs(deltaY) > 0.05;
      }

      this.pieces[index].style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    }

    if (trailVisible || stillMoving) {
      this.requestRender();
    }
  };

  private addHistoryPoint(x: number, y: number, time: number): void {
    const latest = this.history[this.history.length - 1];

    if (latest && latest.x === x && latest.y === y) {
      latest.time = time;
    } else {
      this.history.push({ x, y, time });
    }

    const oldestTime = time - this.cloneDelay * (this.pieces.length - 1) - 300;

    while (this.history.length > 2 && this.history[1].time < oldestTime) {
      this.history.shift();
    }
  }

  private getHistoryPoint(time: number): { x: number; y: number } {
    const first = this.history[0];

    if (!first) {
      return { x: this.pointerX, y: this.pointerY };
    }

    if (time <= first.time) {
      return first;
    }

    for (let index = 1; index < this.history.length; index += 1) {
      const older = this.history[index - 1];
      const newer = this.history[index];

      if (time <= newer.time) {
        const duration = newer.time - older.time;

        if (duration <= 0) {
          return newer;
        }

        const progress = (time - older.time) / duration;
        return {
          x: older.x + (newer.x - older.x) * progress,
          y: older.y + (newer.y - older.y) * progress,
        };
      }
    }

    return this.history[this.history.length - 1];
  }

  private syncEnabledState(): void {
    if (this.mediaQuery?.matches) {
      this.enable();
      return;
    }

    this.disable();
  }

  private enable(): void {
    if (this.enabled) {
      return;
    }

    this.enabled = true;
    document.documentElement.classList.add('custom-cursor-enabled');
    this.zone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      window.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
      window.addEventListener('pointerup', this.handlePointerUp, { passive: true });
      window.addEventListener('blur', this.handlePointerLeave);
      document.documentElement.addEventListener('mouseleave', this.handlePointerLeave);
    });
  }

  private disable(): void {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
    this.visible = false;
    document.documentElement.classList.remove('custom-cursor-enabled');
    this.element.nativeElement.classList.remove('is-visible', 'is-interactive', 'is-pressed');
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('blur', this.handlePointerLeave);
    document.documentElement.removeEventListener('mouseleave', this.handlePointerLeave);

    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private requestRender(): void {
    if (this.animationFrame === null) {
      this.animationFrame = window.requestAnimationFrame(this.render);
    }
  }
}
