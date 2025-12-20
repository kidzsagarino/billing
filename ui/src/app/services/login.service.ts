import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../env/env";

@Injectable({ providedIn: 'root' })
export class LoginService {
    
    constructor(private httpClient: HttpClient) {}

    private apiUrl = `${environment.apiUrl}/users/login`;

    
    login(email: string, password: string) {
        return this.httpClient.post<{ success: boolean }>(`${this.apiUrl}`, { email, password });  
    }

    logout(): void {
        localStorage.removeItem('billing.authToken');
    }   
    isLoggedIn(): boolean {
        return !!localStorage.getItem('billing.authToken');
    }
}