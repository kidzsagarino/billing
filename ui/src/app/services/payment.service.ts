import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' }) 
export default class PaymentService {
    private apiUrl = 'http://localhost:3000/api/payments';
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
}