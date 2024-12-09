import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
})
export class FilterComponent {
  filterTerm = '';
  private filterSubject = new Subject<string>();

  @Output() filter = new EventEmitter<string>();

  constructor() {
    this.filterSubject.pipe(debounceTime(300)).subscribe(value => {
      this.filter.emit(value);
    });
  }

  onFilter() {
    this.filterSubject.next(this.filterTerm);
  }

  clearFilter() {
    this.filterTerm = '';
    this.onFilter();
  }
}
