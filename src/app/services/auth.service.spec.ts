import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
    };

    const mockLoginRequest = {
        username: 'testuser',
        password: 'password123'
    };

    const mockRegisterRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
        checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should login successfully and store user data', (done) => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe(user => {
                expect(user).toEqual(mockUser);

                // Wait for the /me request to complete and update the user state
                service.currentUser$.subscribe(currentUser => {
                    if (currentUser) {
                        expect(service.isAuthenticated()).toBe(true);
                        expect(service.getCurrentUser()).toEqual(mockUser);
                        done();
                    }
                });
            });

            const req = httpMock.expectOne('http://localhost:8080/login');
            expect(req.request.method).toBe('POST');
            expect(req.request.withCredentials).toBe(true);
            expect(req.request.body).toEqual(mockLoginRequest);
            req.flush(mockUser);

            const checkAuthReq2 = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq2.flush(mockUser);
        });

        it('should handle login failure', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(401);
                    expect(service.isAuthenticated()).toBe(false);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/login');
            req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
        });

        it('should handle network errors during login', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(0);
                    expect(service.isAuthenticated()).toBe(false);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/login');
            req.error(new ErrorEvent('Network error'));
        });
    });

    describe('register', () => {
        it('should register successfully', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.register(mockRegisterRequest).subscribe(user => {
                expect(user).toEqual(mockUser);
            });

            const req = httpMock.expectOne('http://localhost:8080/register');
            expect(req.request.method).toBe('POST');
            expect(req.request.withCredentials).toBe(true);
            expect(req.request.body).toEqual(mockRegisterRequest);
            req.flush(mockUser);

            const checkAuthReq2 = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq2.flush(mockUser);
        });

        it('should handle registration with existing username', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.register(mockRegisterRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(409);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/register');
            req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
        });

        it('should handle validation errors during registration', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            const invalidRequest = { ...mockRegisterRequest, email: 'invalid-email' };

            service.register(invalidRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(400);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/register');
            req.flush('Invalid email format', { status: 400, statusText: 'Bad Request' });
        });
    });

    describe('logout', () => {
        it('should logout successfully and clear user data', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe();
            const loginReq = httpMock.expectOne('http://localhost:8080/login');
            loginReq.flush(mockUser);
            const checkAuthReq2 = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq2.flush(mockUser);

            service.logout().subscribe(() => {
                expect(service.isAuthenticated()).toBe(false);
                expect(service.getCurrentUser()).toBeNull();
            });

            const req = httpMock.expectOne('http://localhost:8080/logout');
            expect(req.request.method).toBe('POST');
            expect(req.request.withCredentials).toBe(true);
            req.flush({});
        });

        it('should handle logout error gracefully', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.logout().subscribe({
                next: () => {
                    expect(service.isAuthenticated()).toBe(false);
                },
                error: (error: any) => {
                    expect(error.status).toBe(500);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/logout');
            req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('deleteAccount', () => {
        it('should delete account successfully', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.deleteAccount().subscribe(() => {
                expect(service.isAuthenticated()).toBe(false);
                expect(service.getCurrentUser()).toBeNull();
            });

            const req = httpMock.expectOne('http://localhost:8080/delete');
            expect(req.request.method).toBe('POST');
            expect(req.request.withCredentials).toBe(true);
            req.flush({});
        });

        it('should handle account deletion error', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.deleteAccount().subscribe({
                next: () => fail('should have failed'),
                error: (error: any) => {
                    expect(error.status).toBe(500);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/delete');
            req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('Authentication State Management', () => {
        it('should initialize as unauthenticated', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            expect(service.isAuthenticated()).toBe(false);
            expect(service.getCurrentUser()).toBeNull();
        });

        it('should store and retrieve user data correctly', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe();
            const req = httpMock.expectOne('http://localhost:8080/login');
            req.flush(mockUser);
            const checkAuthReq2 = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq2.flush(mockUser);

            expect(service.isAuthenticated()).toBe(true);
            expect(service.getCurrentUser()).toEqual(mockUser);
        });

        it('should clear authentication state on logout', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe();
            const loginReq = httpMock.expectOne('http://localhost:8080/login');
            loginReq.flush(mockUser);
            const checkAuthReq2 = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq2.flush(mockUser);

            service.logout().subscribe();
            const logoutReq = httpMock.expectOne('http://localhost:8080/logout');
            logoutReq.flush({});

            expect(service.isAuthenticated()).toBe(false);
            expect(service.getCurrentUser()).toBeNull();
        });
    });

    describe('Request Configuration', () => {
        it('should include credentials in all requests', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe();
            const req = httpMock.expectOne('http://localhost:8080/login');
            expect(req.request.withCredentials).toBe(true);
            req.flush(mockUser);
            const checkAuthReq2 = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq2.flush(mockUser);
        });

        it('should use correct content type for requests', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe();
            const req = httpMock.expectOne('http://localhost:8080/login');
            expect(req.request.headers.get('Content-Type')).toContain('application/json');
            req.flush(mockUser);
            const checkAuthReq2 = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq2.flush(mockUser);
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(0);
                    expect(service.isAuthenticated()).toBe(false);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/login');
            req.error(new ErrorEvent('Network error'));
        });

        it('should handle server errors', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.status).toBe(500);
                    expect(service.isAuthenticated()).toBe(false);
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/login');
            req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty response from server', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error).toBeDefined();
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/login');
            req.flush(null);
        });

        it('should handle malformed JSON response', () => {
            const checkAuthReq = httpMock.expectOne('http://localhost:8080/me');
            checkAuthReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            service.login(mockLoginRequest).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error).toBeDefined();
                }
            });

            const req = httpMock.expectOne('http://localhost:8080/login');
            req.flush('invalid json', { status: 200, statusText: 'OK' });
        });
    });
}); 