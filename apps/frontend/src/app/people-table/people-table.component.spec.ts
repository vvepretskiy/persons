import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeopleComponent } from './people-table.component';
import { PeopleService } from '../services/people.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PeopleComponent', () => {
  let component: PeopleComponent;
  let fixture: ComponentFixture<PeopleComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const peopleServiceMock = {
      getPeople: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PeopleComponent, FormsModule],
      providers: [
        { provide: PeopleService, useValue: peopleServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(), 

      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PeopleComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate on page change', () => {
    component.onPageChange(2);
    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { page: 2 },
      queryParamsHandling: 'merge',
    });
  });

  it('should adjust page if needed', () => {
    component.totalItems = 15; // Assuming 10 items per page
    component.page = 2; // Current page
    component.adjustPageIfNeeded();
    expect(component.page).toBe(2); // Should remain the same

    component.totalItems = 5; // Less than 10 items
    component.page = 2; // Current page
    component.adjustPageIfNeeded();
    expect(component.page).toBe(1); // Should adjust to the last page
  });
});
