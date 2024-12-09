import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PeopleService } from './people.service';
import { environment } from '../../environments/environment';
import { People } from '@persons/shared';
import { provideHttpClient } from '@angular/common/http';

describe('PeopleService', () => {
    let service: PeopleService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PeopleService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(PeopleService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch people from API and cache the response', () => {
        const mockResponse: People = {
            data: [{ name: 'C-3PO', height: '180', birth_year: '112BBY', homeworld: 'Unknown', terrain: 'Unknown' }],
            totalCount: 1,
        };

        service.getPeople(1, 'C-3PO').subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}?page=1&search=C-3PO`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        service.getPeople(1, 'C-3PO').subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        httpMock.expectNone(`${environment.apiUrl}?page=1&search=C-3PO`);
    });

    it('should handle cache expiration', () => {
        const mockResponse: People = {
            data: [{ name: 'C-3PO', height: '180', birth_year: '112BBY', homeworld: 'Unknown', terrain: 'Unknown' }],
            totalCount: 1,
        };

        service['cacheDuration'] = -1;
        service.getPeople(1, 'C-3PO').subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}?page=1&search=C-3PO`);
        req.flush(mockResponse); 

        service.getPeople(1, 'C-3PO').subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        const newReq = httpMock.expectOne(`${environment.apiUrl}?page=1&search=C-3PO`);
        expect(newReq.request.method).toBe('GET');
        newReq.flush(mockResponse);
    });
});
