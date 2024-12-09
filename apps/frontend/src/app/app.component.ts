import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PeopleComponent } from './people-table/people-table.component';

@Component({
  standalone: true,
  imports: [PeopleComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'frontend';
}
