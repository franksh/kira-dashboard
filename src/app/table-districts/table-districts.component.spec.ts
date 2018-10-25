import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDistrictsComponent } from './table-districts.component';

describe('TableDistrictsComponent', () => {
  let component: TableDistrictsComponent;
  let fixture: ComponentFixture<TableDistrictsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableDistrictsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableDistrictsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
