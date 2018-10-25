import { fakeAsync, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
describe('DashboardComponent', function () {
    var component;
    var fixture;
    beforeEach(fakeAsync(function () {
        TestBed.configureTestingModule({
            declarations: [DashboardComponent]
        })
            .compileComponents();
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));
    it('should compile', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=dashboard.component.spec.js.map