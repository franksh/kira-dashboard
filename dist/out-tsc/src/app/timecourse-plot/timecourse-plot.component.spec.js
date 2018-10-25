import { async, TestBed } from '@angular/core/testing';
import { TimecoursePlotComponent } from './timecourse-plot.component';
describe('TimecoursePlotComponent', function () {
    var component;
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            declarations: [TimecoursePlotComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = TestBed.createComponent(TimecoursePlotComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=timecourse-plot.component.spec.js.map