import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // Check auth status when service is created
        this.checkAuthStatus();
    }

    private checkAuthStatus(): void {
        this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
            next: (user) => this.currentUserSubject.next(user),
            error: () => this.currentUserSubject.next(null)
        });
    }

    login(credentials: LoginRequest): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/login`,
            credentials,
            {
                withCredentials: true,
                headers: new HttpHeaders({ 'Content-Type': 'application/json' })
            }
        ).pipe(
            tap(() => this.checkAuthStatus())
        );
    }

    register(userData: RegisterRequest): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/register`,
            userData,
            {
                withCredentials: true,
                headers: new HttpHeaders({ 'Content-Type': 'application/json' })
            }
        ).pipe(
            tap(() => this.checkAuthStatus())
        );
    }

    logout(): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/logout`,
            {},
            {
                withCredentials: true,
                headers: new HttpHeaders({ 'Content-Type': 'application/json' })
            }
        ).pipe(
            tap(() => this.currentUserSubject.next(null))
        );
    }

    deleteAccount(): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/delete`,
            {},
            {
                withCredentials: true,
                headers: new HttpHeaders({ 'Content-Type': 'application/json' })
            }
        ).pipe(
            tap(() => this.currentUserSubject.next(null))
        );
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return this.currentUserSubject.value !== null;
    }
} 