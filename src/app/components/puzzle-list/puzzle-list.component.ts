import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuzzleService, Puzzle } from '../../services/puzzle.service';

@Component({
  selector: 'app-puzzle-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="puzzle-list-container">
      <h2>MY PUZZLES</h2>
      
      <div *ngIf="isLoading" class="loading">
        LOADING PUZZLES
      </div>
      
      <div *ngIf="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="!isLoading && puzzles.length === 0" class="no-puzzles">
        <p>NO PUZZLES FOUND</p>
        <p>CREATE YOUR FIRST PUZZLE!</p>
      </div>
      
      <div class="puzzle-grid" *ngIf="!isLoading && puzzles.length > 0">
        <div 
          *ngFor="let puzzle of puzzles" 
          class="puzzle-card retro-card"
          (click)="selectPuzzle(puzzle)"
        >
          <h3>{{ puzzle.title }}</h3>
          <span *ngIf="completedPuzzles.has(puzzle.id)" class="completed-badge">COMPLETED</span>
          <p>CREATED: {{ formatDate(puzzle.created) }}</p>
          <div class="puzzle-actions">
            <button class="btn btn-primary" (click)="playPuzzleAction(puzzle); $event.stopPropagation()">
              PLAY
            </button>
            <button class="btn btn-secondary" (click)="editPuzzleAction(puzzle); $event.stopPropagation()">
              EDIT
            </button>
            <button class="btn btn-secondary" (click)="deletePuzzle(puzzle.id); $event.stopPropagation()">
              DELETE
            </button>
          </div>
        </div>
      </div>
      
      <div class="create-puzzle">
        <button class="btn btn-primary" (click)="createNewPuzzle()">
          CREATE NEW PUZZLE
        </button>
      </div>
    </div>
  `,
  styles: [`
    .puzzle-list-container {
      padding: 2rem;
    }
    
    .puzzle-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .puzzle-card {
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .puzzle-card:hover {
      transform: translateY(-5px);
      box-shadow: 8px 8px 16px var(--paper-shadow);
    }
    
    .puzzle-card h3 {
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    
    .puzzle-card p {
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }
    
    .puzzle-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    
    .puzzle-actions .btn {
      flex: 1;
      min-width: 60px;
      font-size: 0.6rem;
      padding: 0.5rem 0.75rem;
    }
    
    .create-puzzle {
      text-align: center;
      margin-top: 3rem;
    }
    
    .no-puzzles {
      text-align: center;
      padding: 3rem;
      color: var(--paper-darker);
    }
    
    .no-puzzles p {
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }
    
    .completed-badge {
      display: inline-block;
      background: var(--highlight);
      color: var(--paper-black);
      font-family: 'Press Start 2P', monospace;
      font-size: 0.7rem;
      padding: 0.2rem 0.7rem;
      border-radius: 6px;
      margin-left: 0.5rem;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;
      box-shadow: 2px 2px 6px var(--paper-shadow);
    }
  `]
})
export class PuzzleListComponent implements OnInit {
  @Input() completedPuzzles: Set<number> = new Set();
  puzzles: Puzzle[] = [];
  isLoading = false;
  errorMessage = '';
  @Output() createNew = new EventEmitter<void>();
  @Output() playPuzzle = new EventEmitter<number>();
  @Output() editPuzzle = new EventEmitter<number>();

  constructor(private puzzleService: PuzzleService) { }

  ngOnInit(): void {
    this.loadPuzzles();
  }

  loadPuzzles(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.puzzles = []; // Reset to empty array

    this.puzzleService.getMyPuzzles().subscribe({
      next: (puzzles) => {
        this.puzzles = puzzles || []; // Ensure it's never null
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading puzzles:', error);
        this.errorMessage = 'FAILED TO LOAD PUZZLES';
        this.puzzles = []; // Ensure it's never null
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  selectPuzzle(puzzle: Puzzle): void {
    console.log('Selected puzzle:', puzzle);
    // TODO: Navigate to puzzle detail or play view
  }

  playPuzzleAction(puzzle: Puzzle): void {
    console.log('Play puzzle:', puzzle);
    this.playPuzzle.emit(puzzle.id);
  }

  editPuzzleAction(puzzle: Puzzle): void {
    console.log('Edit puzzle:', puzzle);
    this.editPuzzle.emit(puzzle.id);
  }

  createNewPuzzle(): void {
    console.log('Create new puzzle');
    this.createNew.emit();
  }

  deletePuzzle(puzzleId: number): void {
    if (confirm('ARE YOU SURE YOU WANT TO DELETE THIS PUZZLE?')) {
      this.puzzleService.deletePuzzle(puzzleId).subscribe({
        next: () => {
          this.loadPuzzles(); // Reload the list
        },
        error: (error) => {
          this.errorMessage = 'FAILED TO DELETE PUZZLE';
        }
      });
    }
  }

  onPuzzleCompleted(puzzleId: number) {
    this.completedPuzzles.add(puzzleId);
  }
} 