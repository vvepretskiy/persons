import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment'; // Adjust the path as 
import { People } from '@persons/shared';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  private readonly apiUrl = environment.apiUrl;
  private timestamp = 0;
  private cache: { [key: string]: People } = {};
  private cacheDuration = environment.cacheDuration;

  constructor(private http: HttpClient) { }

  getPeople(page: number, search: string): Observable<People> {
    const cacheKey = `page-${page}&search-${search}`;
    const cachedResponse = this.cache[cacheKey];
    const isExpired = Date.now() > this.cacheDuration + this.timestamp;

    if (cachedResponse && !isExpired) {
      return of(cachedResponse);
    }

    return this.http.get<People>(`${this.apiUrl}?page=${page}&search=${search}`).pipe(
      tap((response) => {
        const lastPage = Math.ceil(response.totalCount / 10) || 1;
        if (page > lastPage) {
          this.cache[`page-${lastPage}&search-${search}`] = response;
        } else {
          this.cache[cacheKey] = response;
        }
        if(isExpired) {
          this.timestamp = Date.now();
        }
      })
    );
  }
}