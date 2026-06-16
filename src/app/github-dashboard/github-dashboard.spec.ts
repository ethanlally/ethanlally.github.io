import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GithubDashboardComponent } from './github-dashboard';

describe('GithubDashboardComponent', () => {
  let component: GithubDashboardComponent;
  let fixture: ComponentFixture<GithubDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GithubDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GithubDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
