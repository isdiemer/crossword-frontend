import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { PuzzleService, Puzzle, CreatePuzzleRequest, GuessRequest } from './puzzle.service';

describe('PuzzleService', () => {
    let service: PuzzleService;
    let httpMock: HttpTestingController;

    const mockPuzzle: Puzzle = {
        id: 1,
        title: 'Test Puzzle',
        grid: [{ letter: 'A', isBlack: false }],
        clues: { across: [], down: [] },
        solution: ['A'],
        authorID: 1,
        created: '2024-01-01T00:00:00Z'
    };

    const mockCreateRequest: CreatePuzzleRequest = {
        title: 'New Puzzle',
        grid: [{ letter: 'A', isBlack: false }],
        clues: { across: [], down: [] },
        solution: ['A']
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PuzzleService]
        });
        service = TestBed.inject(PuzzleService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getMyPuzzles', () => {
        it('should return puzzles for authenticated user', () => {
            const mockPuzzles = [mockPuzzle];

            service.getMyPuzzles().subscribe(puzzles => {
                expect(puzzles).toEqual(mockPuzzles);
            });

            const req = httpMock.expectOne('http://localhost:8080/my-puzzles');
            expect(req.request.method).toBe('GET');
            expect(req.request.withCredentials).toBe(true);
            req.flush(mockPuzzles);
        });

        it('should handle error when getting puzzles fails', () => {
            service.getMyPuzzles().subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(401);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/my-puzzles');
            req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
        });
    });

    describe('getPuzzleById', () => {
        it('should return puzzle by id', () => {
            service.getPuzzleById(1).subscribe(puzzle => {
                expect(puzzle).toEqual(mockPuzzle);
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles/1');
            expect(req.request.method).toBe('GET');
            expect(req.request.withCredentials).toBe(true);
            req.flush(mockPuzzle);
        });

        it('should handle error when puzzle not found', () => {
            service.getPuzzleById(999).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(404);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles/999');
            req.flush('Not found', { status: 404, statusText: 'Not Found' });
        });
    });

    describe('createPuzzle', () => {
        it('should create new puzzle successfully', () => {
            service.createPuzzle(mockCreateRequest).subscribe(puzzle => {
                expect(puzzle).toEqual(mockPuzzle);
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles');
            expect(req.request.method).toBe('POST');
            expect(req.request.withCredentials).toBe(true);
            expect(req.request.body).toEqual(mockCreateRequest);
            req.flush(mockPuzzle);
        });

        it('should handle validation error when creating puzzle', () => {
            service.createPuzzle(mockCreateRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(400);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles');
            req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
        });
    });

    describe('updatePuzzle', () => {
        it('should update existing puzzle successfully', () => {
            service.updatePuzzle(1, mockCreateRequest).subscribe(puzzle => {
                expect(puzzle).toEqual(mockPuzzle);
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles/1');
            expect(req.request.method).toBe('PUT');
            expect(req.request.withCredentials).toBe(true);
            expect(req.request.body).toEqual(mockCreateRequest);
            req.flush(mockPuzzle);
        });

        it('should handle unauthorized error when updating puzzle', () => {
            service.updatePuzzle(1, mockCreateRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(403);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles/1');
            req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
        });
    });

    describe('deletePuzzle', () => {
        it('should delete puzzle successfully', () => {
            service.deletePuzzle(1).subscribe(() => {
                // Should complete without error
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles/1');
            expect(req.request.method).toBe('DELETE');
            expect(req.request.withCredentials).toBe(true);
            req.flush(null, { status: 204, statusText: 'No Content' });
        });

        it('should handle error when deleting puzzle fails', () => {
            service.deletePuzzle(1).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(500);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles/1');
            req.flush('Internal server error', { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('submitGuess', () => {
        it('should submit guess successfully', () => {
            const guessRequest: GuessRequest = {
                puzzleId: 1,
                guess: 'A',
                position: { row: 0, col: 0 }
            };

            const mockResponse = { correct: true, message: 'Correct!' };

            service.submitGuess(guessRequest).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne('http://localhost:8080/guess');
            expect(req.request.method).toBe('POST');
            expect(req.request.withCredentials).toBe(true);
            expect(req.request.body).toEqual(guessRequest);
            req.flush(mockResponse);
        });

        it('should handle incorrect guess', () => {
            const guessRequest: GuessRequest = {
                puzzleId: 1,
                guess: 'B',
                position: { row: 0, col: 0 }
            };

            const mockResponse = { correct: false, message: 'Incorrect' };

            service.submitGuess(guessRequest).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne('http://localhost:8080/guess');
            req.flush(mockResponse);
        });
    });

    describe('validateGuess', () => {
        it('should validate guess grid successfully', () => {
            const gridData = { grid: [{ letter: 'A', isBlack: false }] };
            const mockResponse = { valid: true, score: 100 };

            service.validateGuess(1, gridData).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles/1/validate-guess');
            expect(req.request.method).toBe('POST');
            expect(req.request.withCredentials).toBe(true);
            expect(req.request.body).toEqual(gridData);
            req.flush(mockResponse);
        });

        it('should handle invalid guess grid', () => {
            const gridData = { grid: [] };
            const mockResponse = { valid: false, errors: ['Grid is empty'] };

            service.validateGuess(1, gridData).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne('http://localhost:8080/puzzles/1/validate-guess');
            req.flush(mockResponse);
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors', () => {
            service.getMyPuzzles().subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(0);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/my-puzzles');
            req.error(new ErrorEvent('Network error'));
        });

        it('should handle server errors', () => {
            service.getMyPuzzles().subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(500);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/my-puzzles');
            req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('Request Headers and Configuration', () => {
        it('should include credentials in all requests', () => {
            service.getMyPuzzles().subscribe();

            const req = httpMock.expectOne('http://localhost:8080/my-puzzles');
            expect(req.request.withCredentials).toBe(true);
            req.flush([]);
        });

        it('should use correct content type for POST requests', () => {
            service.createPuzzle(mockCreateRequest).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/puzzles');
            expect(req.request.headers.get('Content-Type')).toContain('application/json');
            req.flush(mockPuzzle);
        });
    });
}); 