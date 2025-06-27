import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import { PuzzleListComponent } from './components/puzzle-list/puzzle-list.component';
import { AboutComponent } from './components/about/about.component';
import { PuzzleEditorComponent } from './components/puzzle-editor/puzzle-editor.component';
import { PuzzlePlayerComponent } from './components/puzzle-player/puzzle-player.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, LoginComponent, PuzzleListComponent, AboutComponent, PuzzleEditorComponent, PuzzlePlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  showLogin = false;
  showPuzzles = false;
  showHome = true;
  showAbout = false;
  showEditor = false;
  showPlayer = false;
  selectedPuzzleId: number = 0;
  completedPuzzles = new Set<number>();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Subscribe to user changes after component is initialized
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && !this.showHome) {
        this.showLogin = false;
        this.showPuzzles = true;
        this.showHome = false;
        this.showAbout = false;
        this.showEditor = false;
        this.showPlayer = false;
      } else if (!user && !this.showHome) {  // Only redirect if not already showing home
        this.showLogin = true;
        this.showPuzzles = false;
        this.showHome = false;
        this.showAbout = false;
        this.showEditor = false;
        this.showPlayer = false;
      }
    });
  }

  onLogin(): void {
    this.showLogin = true;
    this.showPuzzles = false;
    this.showHome = false;
    this.showAbout = false;
    this.showEditor = false;
    this.showPlayer = false;
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }

  onPuzzles(): void {
    this.showPuzzles = true;
    this.showLogin = false;
    this.showHome = false;
    this.showAbout = false;
    this.showEditor = false;
    this.showPlayer = false;
  }

  onHome(): void {
    this.showLogin = false;
    this.showPuzzles = false;
    this.showHome = true;
    this.showAbout = false;
    this.showEditor = false;
    this.showPlayer = false;
  }

  onAbout(): void {
    this.showLogin = false;
    this.showPuzzles = false;
    this.showHome = false;
    this.showAbout = true;
    this.showEditor = false;
    this.showPlayer = false;
  }

  onEditor(): void {
    this.showLogin = false;
    this.showPuzzles = false;
    this.showHome = false;
    this.showAbout = false;
    this.showEditor = true;
    this.showPlayer = false;
    this.selectedPuzzleId = 0;
  }

  onEditPuzzle(puzzleId: number): void {
    this.showLogin = false;
    this.showPuzzles = false;
    this.showHome = false;
    this.showAbout = false;
    this.showEditor = true;
    this.showPlayer = false;
    this.selectedPuzzleId = puzzleId;
  }

  onPlayPuzzle(puzzleId: number): void {
    this.showLogin = false;
    this.showPuzzles = false;
    this.showHome = false;
    this.showAbout = false;
    this.showEditor = false;
    this.showPlayer = true;
    this.selectedPuzzleId = puzzleId;
  }

  onPuzzleCompleted(puzzleId: number) {
    this.completedPuzzles.add(puzzleId);
  }
}
