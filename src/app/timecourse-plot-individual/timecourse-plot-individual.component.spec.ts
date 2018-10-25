import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimecoursePlotIndividualComponent } from './timecourse-plot-individual.component';

describe('TimecoursePlotIndividualComponent', () => {
  let component: TimecoursePlotIndividualComponent;
  let fixture: ComponentFixture<TimecoursePlotIndividualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimecoursePlotIndividualComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimecoursePlotIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
