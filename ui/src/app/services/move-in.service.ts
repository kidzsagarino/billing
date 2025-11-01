import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MoveInService {
  private apiUrl = 'http://localhost:3000/api/moveins';

  constructor(private http: HttpClient) {}

  /**
   * Get all Move-In records (optionally filtered by building, unit, unitNumber, paginated)
   */
  getAll(buildingId?: string, unitId?: string, page: number = 1, limit: number = 10, unitNumber?: string): Observable<any> {
    let params = new HttpParams();
    if (buildingId) params = params.set('buildingId', buildingId);
    if (unitId) params = params.set('unitId', unitId);
    if (unitNumber) params = params.set('unitNumber', unitNumber);
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Get a single Move-In record by ID
   */
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new Move-In record
   */
  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Update an existing Move-In record
   */
  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete a Move-In record
   */
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Search Move-In records by name, email, or mobile number
   */
  search(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { q: term },
    });
  }
}