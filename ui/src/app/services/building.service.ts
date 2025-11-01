import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BuildingService {
  private apiUrl = 'http://localhost:3000/api/buildings';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUnitsByBuilding(buildingId: string): any[] {
    // Replace this with API call if needed
    // Example static structure for demo
    const allUnits = JSON.parse(localStorage.getItem('units') || '[]');
    return allUnits.filter((u: any) => u.BuildingId === buildingId);
  }
}