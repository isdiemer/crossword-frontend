import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: jasmine.createSpyObj('Observable', ['subscribe'])
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: spy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize with default values', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.currentUser).toBeNull();
    expect(app.showLogin).toBe(false);
    expect(app.showHome).toBe(true);
    expect(app.selectedPuzzleId).toBe(0);
  });

  it('should handle navigation methods', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.onLogin();
    expect(app.showLogin).toBe(true);
    expect(app.showHome).toBe(false);

    app.onHome();
    expect(app.showHome).toBe(true);
    expect(app.showLogin).toBe(false);

    app.onPuzzles();
    expect(app.showPuzzles).toBe(true);
    expect(app.showHome).toBe(false);

    app.onAbout();
    expect(app.showAbout).toBe(true);
    expect(app.showPuzzles).toBe(false);

    app.onEditor();
    expect(app.showEditor).toBe(true);
    expect(app.showAbout).toBe(false);
    expect(app.selectedPuzzleId).toBe(0);
  });

  it('should handle puzzle selection', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.onEditPuzzle(5);
    expect(app.showEditor).toBe(true);
    expect(app.selectedPuzzleId).toBe(5);

    app.onPlayPuzzle(10);
    expect(app.showPlayer).toBe(true);
    expect(app.selectedPuzzleId).toBe(10);
  });

  it('should handle logout', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    // Mock the logout method to return an observable
    authService.logout.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

    app.onLogout();
    expect(authService.logout).toHaveBeenCalled();
  });
});
