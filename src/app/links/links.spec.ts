import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Links } from './links';

describe('Links', () => {
  let component: Links;
  let fixture: ComponentFixture<Links>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Links],
    }).compileComponents();

    fixture = TestBed.createComponent(Links);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
