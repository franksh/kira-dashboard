import { TestBed, inject } from '@angular/core/testing';
import { ChoroplethService } from './choropleth.service';
describe('ChoroplethService', function () {
    beforeEach(function () {
        TestBed.configureTestingModule({
            providers: [ChoroplethService]
        });
    });
    it('should be created', inject([ChoroplethService], function (service) {
        expect(service).toBeTruthy();
    }));
});
//# sourceMappingURL=choropleth.service.spec.js.map