import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnitService {
  private apiUrl = 'http://localhost:3000/api/units'; // adjust based on your backend route

  constructor(private http: HttpClient) {}

  // Get all units
  getAllUnits(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Get units by building (optional)
  getUnitsByBuilding(buildingId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?building=${buildingId}`);
  }

  // Create a new unit
  createUnit(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Update a unit
  updateUnit(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Delete a unit
  deleteUnit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}