import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AnnikaComponent } from './annika';

describe('AnnikaComponent', () => {
  let fixture: ComponentFixture<AnnikaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnikaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnikaComponent);
    await fixture.whenStable();
  });

  it('renders the dedication', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Annika');
    expect(element.textContent).toContain('I love you');
    expect(element.textContent).toContain('Ethan');
  });

  it('shows a love note when the heart is pressed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('.heart-button');

    button?.click();
    fixture.detectChanges();

    expect(element.querySelector('.love-message')?.textContent).toContain('I love you');
    vi.restoreAllMocks();
  });
});
