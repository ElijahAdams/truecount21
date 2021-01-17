import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayingHandComponent } from './playing-hand.component';

describe('PlayingHandComponent', () => {
  let component: PlayingHandComponent;
  let fixture: ComponentFixture<PlayingHandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayingHandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayingHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
