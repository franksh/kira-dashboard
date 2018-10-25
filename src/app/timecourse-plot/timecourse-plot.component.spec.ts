import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimecoursePlotComponent } from './timecourse-plot.component';

describe('TimecoursePlotComponent', () => {
  let component: TimecoursePlotComponent;
  let fixture: ComponentFixture<TimecoursePlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimecoursePlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimecoursePlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
