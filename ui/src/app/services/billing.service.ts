import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BillingRecord } from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

    private apiUrl = 'http://localhost:3000/api/billing'; // Fastify endpoint

    constructor(private http: HttpClient) {}

    getBillingByMonth(month: string): Observable<BillingRecord[]> {
        return this.http.get<BillingRecord[]>(`${this.apiUrl}/billingMonth/${month}`);
    }
    generateBilling(month: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/generate`, { billingMonth: month });
    }
}