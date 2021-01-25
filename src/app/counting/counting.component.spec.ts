import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountingComponent } from './counting.component';

describe('CountingComponent', () => {
  let component: CountingComponent;
  let fixture: ComponentFixture<CountingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
