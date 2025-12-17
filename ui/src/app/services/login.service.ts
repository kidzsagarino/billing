import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class LoginService {
    
    constructor(private httpClient: HttpClient) {}

    private apiUrl = 'http://localhost:3000/api/users';

    private isAuthenticated = false;
    

    login(username: string, password: string) {
        return this.httpClient.post<{ success: boolean }>(`${this.apiUrl}/login`, { username, password });  
    }

    logout(): void {
        this.isAuthenticated = false;
    }   
    isLoggedIn(): boolean {
        return this.isAuthenticated;
    }   
}