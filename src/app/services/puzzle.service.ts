import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Puzzle {
    id: number;
    title: string;
    grid: any;
    clues: any;
    solution: any;
    authorID: number;
    created: string;
}

export interface CreatePuzzleRequest {
    title: string;
    grid: any;
    clues: any;
    solution: any;
}

export interface GuessRequest {
    puzzleId: number;
    grid: any;
}

export interface Guess {
    id: number;
    userID: number;
    puzzleID: number;
    grid: any;
    createdAt: string;
    updatedAt: string;
}

export interface ValidateGuessRequest {
    grid: any;
}

export interface ValidateGuessResponse {
    correct: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PuzzleService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getMyPuzzles(): Observable<Puzzle[]> {
        return this.http.get<Puzzle[]>(`${this.apiUrl}/my-puzzles`, { withCredentials: true });
    }

    getPuzzleById(id: number): Observable<Puzzle> {
        return this.http.get<Puzzle>(`${this.apiUrl}/puzzles/${id}`, { withCredentials: true });
    }

    getGuess(puzzleId: number): Observable<Guess> {
        return this.http.get<Guess>(`${this.apiUrl}/guess/${puzzleId}`, { withCredentials: true });
    }

    createPuzzle(puzzleData: CreatePuzzleRequest): Observable<Puzzle> {
        return this.http.post<Puzzle>(`${this.apiUrl}/puzzles`, puzzleData, { withCredentials: true });
    }

    updatePuzzle(id: number, puzzleData: CreatePuzzleRequest): Observable<Puzzle> {
        return this.http.put<Puzzle>(`${this.apiUrl}/puzzles/${id}`, puzzleData, { withCredentials: true });
    }

    deletePuzzle(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/puzzles/${id}`, { withCredentials: true });
    }

    submitGuess(guessData: GuessRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/guess`, guessData, { withCredentials: true });
    }

    validateGuess(puzzleId: number, request: ValidateGuessRequest): Observable<ValidateGuessResponse> {
        return this.http.post<ValidateGuessResponse>(`${this.apiUrl}/puzzles/${puzzleId}/validate-guess`, request, { withCredentials: true });
    }
} 