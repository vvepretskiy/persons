import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeopleService } from '../services/people.service';
import { Person } from '@persons/shared';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CeilPipe } from '../pipes/ceil.pipe';
import { FilterComponent } from '../filter/filter.component';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-people-table',
  standalone: true,
  imports: [CommonModule, CeilPipe, FilterComponent, FormsModule],
  templateUrl: './people-table.component.html',
  styleUrl: './people-table.component.scss',
  providers: [PeopleService]
})
export class PeopleComponent implements OnInit {
  private filterSubject = new Subject<Params>();

  people: Person[] = [];
  page = 0;
  totalItems = 0;
  filter = '';
  averageHeight?: string;
  isLoading = false;

  constructor(private peopleService: PeopleService, private route: ActivatedRoute, private router: Router) {
    this.filterSubject.pipe(debounceTime(100)).subscribe(params => {
      this.page = +params['page'] || 1;
      this.loadPeople();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filterSubject.next(params);
    });
  }

  loadPeople() {
    if (this.page > 0) {
      this.isLoading = true;
      this.peopleService.getPeople(this.page, this.filter).subscribe(response => {
        this.people = response.data;
        this.isLoading = false;
        this.averageHeight = response.averageHeight;
        this.totalItems = response.totalCount;

        this.adjustPageIfNeeded();
      });
    }
  }

  public adjustPageIfNeeded(): void {
    const lastPage = Math.ceil(this.totalItems / 10) || 1;
    if (this.page > lastPage) {
      this.page = lastPage;
      this.onPageChange(this.page);
    }
  }

  onPageChange(page: number): void {
    this.router.navigate([], {
      queryParams: { page: page },
      queryParamsHandling: 'merge'
    });
  }

  onFilterChange(filterTerm: string) {
    this.filter = filterTerm;
    this.loadPeople();
  }
}
