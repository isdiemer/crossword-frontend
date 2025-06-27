import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PuzzleService, ValidateGuessRequest } from '../../services/puzzle.service';

interface PlayCell {
  letter: string;
  isBlack: boolean;
  number?: number;
  userInput: string;
  isSelected: boolean;
  isHighlighted: boolean;
}

interface PlayClue {
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  isSelected: boolean;
}

@Component({
  selector: 'app-puzzle-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="player">
      <h2>{{ puzzle?.title || 'PUZZLE' }}</h2>
      <div class="controls">
        <button (click)="checkAnswers()">CHECK</button>
        <button (click)="revealAnswers()">REVEAL</button>
        <button (click)="goBack()">BACK</button>
      </div>
      <div *ngIf="checkResult === true" class="completion-banner">🎉 PUZZLE COMPLETE! 🎉</div>
      <div class="main">
        <div class="grid" [style.gridTemplateColumns]="gridTemplate">
          <div *ngFor="let cell of playGrid; let i = index"
               class="cell"
               [class.black]="cell.isBlack"
               [class.selected]="cell.isSelected"
               [class.incorrect]="incorrectCells.has(i)"
               (click)="selectCell(i)"
               (keydown)="handleKeyPress($event, i)"
               tabindex="0">
            <span class="num" *ngIf="cell.number">{{ cell.number }}</span>
            <span class="letter" *ngIf="!cell.isBlack">{{ revealMode ? cell.letter : cell.userInput }}</span>
          </div>
        </div>
        <div class="clues">
          <div class="tabs">
            <button [class.active]="activeTab === 'across'" (click)="activeTab = 'across'">ACROSS</button>
            <button [class.active]="activeTab === 'down'" (click)="activeTab = 'down'">DOWN</button>
          </div>
          <div class="clue-list" *ngIf="activeTab === 'across'">
            <div *ngFor="let clue of acrossClues" class="clue">
              <span class="num">{{ clue.number }}</span> {{ clue.clue }}
            </div>
          </div>
          <div class="clue-list" *ngIf="activeTab === 'down'">
            <div *ngFor="let clue of downClues" class="clue">
              <span class="num">{{ clue.number }}</span> {{ clue.clue }}
            </div>
          </div>
        </div>
      </div>
      <div class="feedback" *ngIf="checkMessage">
        <span [class.success]="checkResult === true" [class.error]="checkResult === false">{{ checkMessage }}</span>
      </div>
    </div>
  `,
  styles: [`
    .player {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background: var(--main-bg);
      border-radius: 8px;
      box-shadow: 0 2px 8px var(--accent);
      font-family: 'Press Start 2P', 'VT323', monospace;
    }
    h2 { text-align: center; }
    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .main {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }
    .grid {
      display: grid;
      gap: 2px;
      background: var(--accent);
      border: 2px solid var(--accent);
      padding: 2px;
    }
    .cell {
      width: 2.5rem;
      height: 2.5rem;
      background: var(--main-bg);
      border: 1px solid var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-size: 1.2rem;
      color: var(--main-fg);
      cursor: pointer;
      transition: background 0.1s;
    }
    .cell.selected { background: var(--highlight); }
    .cell.incorrect { 
      background: var(--error) !important; 
      border-color: var(--error-border) !important; 
    }
    .cell.black {
      background: #000 !important;
      color: #000 !important;
      border: 1px solid #000 !important;
      position: relative;
    }
    .cell.black .num,
    .cell.black .letter {
      display: none !important;
    }
    .num {
      position: absolute;
      top: 2px;
      left: 2px;
      font-size: 0.6rem;
      opacity: 0.7;
    }
    .letter { font-size: 1.2rem; }
    .clues {
      flex: 1;
      min-width: 200px;
    }
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .tabs button {
      flex: 1;
      font-family: inherit;
      background: var(--accent);
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
    }
    .tabs button.active {
      background: var(--highlight);
      color: var(--main-fg);
    }
    .clue-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .clue {
      font-size: 0.9rem;
      padding: 0.2rem 0;
    }
    .feedback {
      margin-top: 1rem;
      text-align: center;
      font-size: 1rem;
    }
    .feedback .success { color: #228B22; }
    .feedback .error { color: #b22222; }
    .completion-banner {
      background: #eaffea;
      color: #228B22;
      font-family: 'Press Start 2P', monospace;
      font-size: 1.3rem;
      text-align: center;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border: 2px solid #22b222;
      border-radius: 8px;
      box-shadow: 0 2px 8px #22b22233;
    }
  `]
})
export class PuzzlePlayerComponent implements OnInit {
  @Input() puzzleId: number = 0;
  @Output() completed = new EventEmitter<number>();
  @Output() back = new EventEmitter<void>();

  puzzle: any = null;
  playGrid: PlayCell[] = [];
  acrossClues: PlayClue[] = [];
  downClues: PlayClue[] = [];
  selectedCell: number | null = null;
  selectedClue: number | null = null;
  activeTab: 'across' | 'down' = 'across';
  currentDirection: 'across' | 'down' = 'across';

  // Feedback and reveal state
  checkMessage: string = '';
  checkResult: boolean | null = null;
  revealMode: boolean = false;
  incorrectCells: Set<number> = new Set();

  get gridTemplate(): string {
    if (!this.puzzle) return 'repeat(15, 1fr)';
    const size = Math.sqrt(this.puzzle.grid.length);
    return `repeat(${size}, 1fr)`;
  }

  get completionPercentage(): number {
    if (!this.playGrid.length) return 0;
    const totalCells = this.playGrid.filter(cell => !cell.isBlack).length;
    const filledCells = this.playGrid.filter(cell => !cell.isBlack && cell.userInput).length;
    return Math.round((filledCells / totalCells) * 100);
  }

  constructor(private puzzleService: PuzzleService) { }

  ngOnInit(): void {
    if (this.puzzleId) {
      this.puzzleService.getPuzzleById(this.puzzleId).subscribe({
        next: (puzzle) => {
          this.puzzle = puzzle;
          this.initializeGrid();
          this.generateClues();
          this.loadSavedProgress(); // Load saved progress after grid initialization
        },
        error: (error) => console.error('Error loading puzzle:', error)
      });
    }
  }

  initializeGrid(): void {
    this.playGrid = this.puzzle.grid.map((cell: any) => ({
      letter: cell.letter || '',
      isBlack: cell.isBlack || false,
      number: cell.number,
      userInput: '',
      isSelected: false,
      isHighlighted: false
    }));
  }

  generateClues(): void {
    this.acrossClues = [];
    this.downClues = [];

    if (this.puzzle.clues?.across) {
      this.acrossClues = this.puzzle.clues.across.map((clue: any) => ({
        ...clue,
        isSelected: false
      }));
    }

    if (this.puzzle.clues?.down) {
      this.downClues = this.puzzle.clues.down.map((clue: any) => ({
        ...clue,
        isSelected: false
      }));
    }
  }

  selectCell(index: number): void {
    this.clearSelection();
    this.selectedCell = index;
    this.playGrid[index].isSelected = true;

    // Highlight the word this cell belongs to
    this.highlightWord(index);

    // Focus the cell for keyboard input
    setTimeout(() => {
      const cellElement = document.querySelector(`.cell:nth-child(${index + 1})`) as HTMLElement;
      if (cellElement) cellElement.focus();
    }, 0);
  }

  selectClue(index: number, direction: 'across' | 'down'): void {
    this.clearSelection();
    this.activeTab = direction;
    this.currentDirection = direction;

    const clues = direction === 'across' ? this.acrossClues : this.downClues;
    clues[index].isSelected = true;
    this.selectedClue = index;

    // Find and select the first cell of this clue
    const clueNumber = clues[index].number;
    const firstCellIndex = this.playGrid.findIndex(cell => cell.number === clueNumber);
    if (firstCellIndex !== -1) {
      this.selectCell(firstCellIndex);
    }
  }

  clearSelection(): void {
    this.playGrid.forEach(cell => {
      cell.isSelected = false;
      cell.isHighlighted = false;
    });
    this.acrossClues.forEach(clue => clue.isSelected = false);
    this.downClues.forEach(clue => clue.isSelected = false);
  }

  highlightWord(index: number): void {
    const size = Math.sqrt(this.playGrid.length);
    const row = Math.floor(index / size);
    const col = index % size;

    // Highlight across word
    if (this.currentDirection === 'across') {
      let currentCol = col;
      while (currentCol >= 0 && !this.playGrid[row * size + currentCol].isBlack) {
        this.playGrid[row * size + currentCol].isHighlighted = true;
        currentCol--;
      }
      currentCol = col + 1;
      while (currentCol < size && !this.playGrid[row * size + currentCol].isBlack) {
        this.playGrid[row * size + currentCol].isHighlighted = true;
        currentCol++;
      }
    }

    // Highlight down word
    if (this.currentDirection === 'down') {
      let currentRow = row;
      while (currentRow >= 0 && !this.playGrid[currentRow * size + col].isBlack) {
        this.playGrid[currentRow * size + col].isHighlighted = true;
        currentRow--;
      }
      currentRow = row + 1;
      while (currentRow < size && !this.playGrid[currentRow * size + col].isBlack) {
        this.playGrid[currentRow * size + col].isHighlighted = true;
        currentRow++;
      }
    }
  }

  handleKeyPress(event: KeyboardEvent, index: number): void {
    if (!this.playGrid[index].isBlack) {
      const key = event.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        this.playGrid[index].userInput = key;
        this.saveProgress(); // Add autosave
        this.moveToNextCell();
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        this.playGrid[index].userInput = '';
        this.saveProgress(); // Add autosave
        if (event.key === 'Backspace') {
          this.moveToPreviousCell();
        }
      }
    }
  }

  moveToNextCell(): void {
    const size = Math.sqrt(this.playGrid.length);
    const nextIndex = this.selectedCell! + 1;

    if (nextIndex >= 0 && nextIndex < this.playGrid.length && !this.playGrid[nextIndex].isBlack) {
      this.selectCell(nextIndex);
    }
  }

  moveToPreviousCell(): void {
    const size = Math.sqrt(this.playGrid.length);
    const prevIndex = this.selectedCell! - 1;

    if (prevIndex >= 0 && prevIndex < this.playGrid.length && !this.playGrid[prevIndex].isBlack) {
      this.selectCell(prevIndex);
    }
  }

  checkAnswers(): void {
    if (!this.puzzle) return;
    this.revealMode = false;
    this.incorrectCells.clear();
    this.checkMessage = '';
    this.checkResult = null;

    console.log('Starting check answers...');
    console.log('Puzzle solution:', this.puzzle.solution);

    // Build user's guess grid for backend validation
    const size = Math.sqrt(this.playGrid.length);
    const guessGrid: string[][] = [];

    for (let row = 0; row < size; row++) {
      const guessRow: string[] = [];
      for (let col = 0; col < size; col++) {
        const index = row * size + col;
        const cell = this.playGrid[index];
        if (cell.isBlack) {
          guessRow.push('#');
        } else {
          guessRow.push(cell.userInput?.toUpperCase() || '');
        }
      }
      guessGrid.push(guessRow);
    }

    console.log('User guess grid:', guessGrid);

    // Call backend validation endpoint
    const validateRequest: ValidateGuessRequest = { grid: guessGrid };
    this.puzzleService.validateGuess(this.puzzleId, validateRequest).subscribe({
      next: (response) => {
        console.log('Backend validation response:', response);

        if (response.correct) {
          this.checkMessage = '🎉 CONGRATULATIONS! PUZZLE COMPLETE!';
          this.checkResult = true;
          this.completed.emit(this.puzzleId);
        } else {
          // If incorrect, highlight wrong cells by comparing with solution
          this.highlightIncorrectCells(guessGrid);
          this.checkMessage = '❌ SOME ANSWERS ARE INCORRECT';
          this.checkResult = false;
          console.log('Incorrect cells set:', Array.from(this.incorrectCells));
        }
      },
      error: (error) => {
        console.error('Error validating guess:', error);
        this.checkMessage = '❌ ERROR VALIDATING ANSWERS';
        this.checkResult = false;
      }
    });
  }

  private highlightIncorrectCells(guessGrid: string[][]): void {
    if (!this.puzzle) return;

    // Defensive: ensure solution is a 2D array
    let solution: string[][] = [];
    if (Array.isArray(this.puzzle.solution)) {
      solution = this.puzzle.solution;
    } else if (typeof this.puzzle.solution === 'string') {
      try {
        solution = JSON.parse(this.puzzle.solution);
      } catch (e) {
        console.error('Failed to parse solution:', e);
        return;
      }
    }

    const size = Math.sqrt(this.playGrid.length);
    console.log('Solution grid:', solution);
    console.log('Guess grid:', guessGrid);

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const index = row * size + col;
        const cell = this.playGrid[index];

        if (!cell.isBlack) {
          const solutionLetter = solution[row]?.[col]?.toUpperCase() || '';
          const userLetter = cell.userInput?.toUpperCase() || '';

          console.log(`Cell ${index} (${row},${col}): solution="${solutionLetter}", user="${userLetter}"`);

          if (userLetter && userLetter !== solutionLetter) {
            console.log(`Marking cell ${index} as incorrect`);
            this.incorrectCells.add(index);
          }
        }
      }
    }
  }

  revealAnswers(): void {
    if (!this.puzzle) return;
    this.revealMode = true;
    this.incorrectCells.clear();
    this.checkMessage = 'Solution revealed!';
    this.checkResult = null;
    // Defensive: ensure solution is a 2D array
    const solution = Array.isArray(this.puzzle.solution) ? this.puzzle.solution : [];
    const size = Math.sqrt(this.playGrid.length);
    for (let row = 0; row < size; row++) {
      const solutionRow = Array.isArray(solution[row]) ? solution[row] : [];
      for (let col = 0; col < size; col++) {
        const index = row * size + col;
        const cell = this.playGrid[index];
        if (!cell.isBlack) {
          cell.userInput = solutionRow[col]?.toUpperCase() || '';
        }
      }
    }
  }

  goBack(): void {
    this.back.emit();
  }

  // Add new method for saving progress
  private saveProgress(): void {
    if (!this.puzzle) return;

    // Build current grid state
    const size = Math.sqrt(this.playGrid.length);
    const guessGrid: string[][] = [];

    for (let row = 0; row < size; row++) {
      const guessRow: string[] = [];
      for (let col = 0; col < size; col++) {
        const index = row * size + col;
        const cell = this.playGrid[index];
        if (cell.isBlack) {
          guessRow.push('#');
        } else {
          guessRow.push(cell.userInput?.toUpperCase() || '');
        }
      }
      guessGrid.push(guessRow);
    }

    // Save progress to backend
    this.puzzleService.submitGuess({
      puzzleId: this.puzzleId,
      grid: guessGrid
    }).subscribe({
      error: (error) => console.error('Error saving progress:', error)
    });
  }

  // Add method to load saved progress
  private loadSavedProgress(): void {
    if (!this.puzzle) return;

    this.puzzleService.getGuess(this.puzzleId).subscribe({
      next: (guess) => {
        if (guess && guess.grid) {
          const savedGrid = guess.grid;
          const size = Math.sqrt(this.playGrid.length);

          for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
              const index = row * size + col;
              const cell = this.playGrid[index];
              if (!cell.isBlack) {
                cell.userInput = savedGrid[row][col] || '';
              }
            }
          }
        }
      },
      error: (error) => console.error('Error loading saved progress:', error)
    });
  }
} 