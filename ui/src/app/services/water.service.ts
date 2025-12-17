import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/env';

@Injectable({
  providedIn: 'root'
})
export class WaterService {
  private apiUrl = `${environment.apiUrl}/water`;

  constructor(private http: HttpClient) {}

  getReadings(billingMonth: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/water-readings/${billingMonth}`);
  }
  getAllReadings(pageNumber:number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/water-readings`);
  }

  saveReading(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/water-readings`, data);
  }
  saveReadingForBillingMonth(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/water-readings/loadForBillingMonth`, data);
  }

  updateReading(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/water-readings/updateConsumption/${id}`, data);
  }
  searchByUnitNumber(unitNumber: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/water-readings/searchByUnit`, { UnitNumber: unitNumber });
  }
  searchByBillingMonth(billingMonth: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/water-readings/searchByBillingMonth`, { BillingMonth: billingMonth });
  }
}