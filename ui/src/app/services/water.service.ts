import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WaterService {
  private apiUrl = 'http://localhost:3000/api/water';

  constructor(private http: HttpClient) {}

  getReadings(billingMonth: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?month=${billingMonth}`);
  }
  getAllReadings(pageNumber:number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/water-readings`);
  }

  saveReading(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/water-readings`, data);
  }
}