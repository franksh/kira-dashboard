import { TestBed, inject } from '@angular/core/testing';
import { DisplayControlService } from './display-control.service';
describe('DisplayControlService', function () {
    beforeEach(function () {
        TestBed.configureTestingModule({
            providers: [DisplayControlService]
        });
    });
    it('should be created', inject([DisplayControlService], function (service) {
        expect(service).toBeTruthy();
    }));
});
//# sourceMappingURL=display-control.service.spec.js.map