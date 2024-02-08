import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class CachingService {
  private cachedDataMap: Map<string, Observable<any>> = new Map();

  constructor(private http: HttpClient) { }

  getData(endpoint: string): Observable<any> {
    if (!this.cachedDataMap.has(endpoint)) {
      // Make API call if data is not already cached
      const data$ = this.http.get<any>(endpoint).pipe(
        // Cache response and share it among subscribers
        shareReplay(1)
      );
      this.cachedDataMap.set(endpoint, data$);
    }
    return this.cachedDataMap.get(endpoint) || of(null);
  }
}
