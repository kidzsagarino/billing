import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../env/env";

@Injectable({ providedIn: 'root' }) 
export default class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private httpClient: HttpClient) {}
    getAllPayments(): Observable<any> {
        return this.httpClient.get<any>(this.apiUrl);
    }
    createPayment(data: any): Observable<any> {
        return this.httpClient.post(this.apiUrl, data);
    }
    updatePayment(id: string, data: any): Observable<any> {
        return this.httpClient.put(`${this.apiUrl}/${id}`, data);
    }
    searchByUnitNumber(unitNumber: string): Observable<any> {
        return this.httpClient.post(`${this.apiUrl}/searchByUnit`, { UnitNumber: unitNumber });
    }
    searchByBillingMonth(billingMonth: string): Observable<any> {
        return this.httpClient.post(`${this.apiUrl}/searchByBillingMonth`, { BillingMonth: billingMonth });
    }
}