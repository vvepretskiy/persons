import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FilterComponent } from './filter.component';
import { FormsModule } from '@angular/forms';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, FilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
  });

  it('should emit filter value after debounce time', fakeAsync(() => {
    let emittedValue: string | undefined;

    component.filter.subscribe((value) => {
      emittedValue = value;
    });

    component.filterTerm = 'test';
    component.onFilter();

    tick(300);
    expect(emittedValue).toBe('test');
  }));
});
