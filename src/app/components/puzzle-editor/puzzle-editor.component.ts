import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PuzzleService, Puzzle } from '../../services/puzzle.service';

interface GridCell {
  letter: string;
  isBlack: boolean;
  number?: number;
  acrossClue?: string;
  downClue?: string;
}

interface Clue {
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
}

@Component({
  selector: 'app-puzzle-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="puzzle-editor-container">
      <div class="editor-header">
        <h2>{{ isEditing ? 'EDIT PUZZLE' : 'PUZZLE EDITOR' }}</h2>
        <div class="header-controls">
          <input 
            type="text" 
            [(ngModel)]="puzzleTitle" 
            placeholder="PUZZLE TITLE"
            class="title-input"
            (input)="onTitleChange()"
          >
          <div class="grid-controls">
            <label>GRID SIZE:</label>
            <input 
              type="number" 
              [(ngModel)]="gridSize" 
              min="3" 
              max="25" 
              (change)="resizeGrid()"
              class="size-input"
              [disabled]="isEditing"
            >
            <button class="btn btn-secondary" (click)="clearGrid()">CLEAR GRID</button>
          </div>
        </div>
      </div>

      <div class="editor-main">
        <div class="grid-section">
          <h3>GRID EDITOR</h3>
          <div class="grid-container">
            <div class="grid" [style.grid-template-columns]="gridTemplate">
              <div 
                *ngFor="let cell of grid; let i = index" 
                class="grid-cell"
                [class.black]="cell.isBlack"
                [class.numbered]="cell.number"
                [class.selected]="selectedCell === i"
                (click)="selectCell(i)"
                (keydown)="handleKeyPress($event, i)"
                tabindex="0"
              >
                <span class="cell-number" *ngIf="cell.number">{{ cell.number }}</span>
                <span class="cell-letter" *ngIf="!cell.isBlack">{{ cell.letter }}</span>
              </div>
            </div>
          </div>
          
          <div class="grid-actions">
            <button class="btn btn-secondary" (click)="toggleBlackSquare()">
              {{ selectedCell !== null && grid[selectedCell].isBlack ? 'MAKE WHITE' : 'MAKE BLACK' }}
            </button>
            <button class="btn btn-secondary" (click)="validateGrid()">VALIDATE GRID</button>
            <button class="btn btn-primary" (click)="checkPuzzle()">CHECK PUZZLE</button>
          </div>
        </div>

        <div class="clues-section">
          <h3>CLUES EDITOR</h3>
          
          <div class="clues-tabs">
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'across'"
              (click)="activeTab = 'across'"
            >
              ACROSS ({{ acrossClues.length }})
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'down'"
              (click)="activeTab = 'down'"
            >
              DOWN ({{ downClues.length }})
            </button>
          </div>

          <div class="clues-list" *ngIf="activeTab === 'across'">
            <div 
              *ngFor="let clue of acrossClues; let i = index" 
              class="clue-item"
              [class.selected]="selectedClue === i"
              (click)="selectClue(i, 'across')"
            >
              <div class="clue-header">
                <span class="clue-number">{{ clue.number }}</span>
                <span class="clue-answer">{{ clue.answer }}</span>
              </div>
              <textarea 
                [(ngModel)]="clue.clue" 
                placeholder="ENTER CLUE..."
                class="clue-text"
                (blur)="updateClue(i, 'across')"
              ></textarea>
            </div>
          </div>

          <div class="clues-list" *ngIf="activeTab === 'down'">
            <div 
              *ngFor="let clue of downClues; let i = index" 
              class="clue-item"
              [class.selected]="selectedClue === i"
              (click)="selectClue(i, 'down')"
            >
              <div class="clue-header">
                <span class="clue-number">{{ clue.number }}</span>
                <span class="clue-answer">{{ clue.answer }}</span>
              </div>
              <textarea 
                [(ngModel)]="clue.clue" 
                placeholder="ENTER CLUE..."
                class="clue-text"
                (blur)="updateClue(i, 'down')"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-footer">
        <div class="validation-status" [class.valid]="isValid" [class.invalid]="!isValid">
          {{ validationMessage }}
        </div>
        <div class="footer-actions">
          <button class="btn btn-secondary" (click)="saveDraft()">SAVE DRAFT</button>
          <button 
            class="btn btn-primary" 
            (click)="submitPuzzle()"
            [disabled]="!isValid || !puzzleTitle.trim()"
          >
            {{ isEditing ? 'UPDATE PUZZLE' : 'PUBLISH PUZZLE' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .puzzle-editor-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .editor-header {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--paper-light);
      border: 2px solid var(--paper-border);
      box-shadow: 4px 4px 8px var(--paper-shadow);
    }

    .editor-header h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--paper-dark);
      font-family: 'Press Start 2P', monospace;
      text-align: center;
    }

    .header-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title-input {
      font-family: 'VT323', monospace;
      font-size: 1.2rem;
      padding: 0.5rem;
      border: 2px solid var(--paper-border);
      background: var(--paper-lighter);
      color: var(--paper-dark);
      min-width: 300px;
    }

    .grid-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .grid-controls label {
      font-family: 'Press Start 2P', monospace;
      font-size: 0.8rem;
      color: var(--paper-dark);
    }

    .size-input {
      font-family: 'VT323', monospace;
      font-size: 1rem;
      padding: 0.5rem;
      border: 2px solid var(--paper-border);
      background: var(--paper-lighter);
      color: var(--paper-dark);
      width: 80px;
    }

    .editor-main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .grid-section, .clues-section {
      padding: 1.5rem;
      background: var(--paper-light);
      border: 2px solid var(--paper-border);
      box-shadow: 4px 4px 8px var(--paper-shadow);
    }

    .grid-section h3, .clues-section h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: var(--paper-dark);
      font-family: 'Press Start 2P', monospace;
      text-align: center;
    }

    .grid-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .grid {
      display: grid;
      gap: 1px;
      background: var(--paper-border);
      border: 2px solid var(--paper-border);
      padding: 1px;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
    }

    .grid-cell {
      width: 40px;
      height: 40px;
      background: var(--paper-lighter);
      border: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      font-family: 'VT323', monospace;
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--paper-dark);
      transition: all 0.2s ease;
    }

    .grid-cell:hover {
      background: var(--paper-light);
      border-color: rgba(0, 0, 0, 0.2);
    }

    .grid-cell.selected {
      background: var(--paper-dark);
      color: var(--paper-light);
      border-color: var(--paper-dark);
    }

    .grid-cell.black {
      background: var(--paper-dark);
      color: var(--paper-light);
      border-color: var(--paper-dark);
    }

    .grid-cell.black.selected {
      background: var(--paper-darker);
      border-color: var(--paper-darker);
    }

    .cell-number {
      position: absolute;
      top: 2px;
      left: 2px;
      font-size: 0.6rem;
      font-family: 'Press Start 2P', monospace;
    }

    .cell-letter {
      font-size: 1.1rem;
    }

    .grid-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .clues-tabs {
      display: flex;
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--paper-border);
    }

    .tab-btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      background: var(--paper-lighter);
      color: var(--paper-darker);
      font-family: 'Press Start 2P', monospace;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      background: var(--paper-dark);
      color: var(--paper-light);
    }

    .clues-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .clue-item {
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--paper-lighter);
      border: 1px solid var(--paper-border);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .clue-item:hover {
      background: var(--paper-light);
    }

    .clue-item.selected {
      background: var(--paper-dark);
      color: var(--paper-light);
    }

    .clue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .clue-number {
      font-family: 'Press Start 2P', monospace;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .clue-answer {
      font-family: 'VT323', monospace;
      font-size: 1rem;
      font-weight: bold;
    }

    .clue-text {
      width: 100%;
      min-height: 60px;
      padding: 0.5rem;
      border: 1px solid var(--paper-border);
      background: var(--paper-light);
      color: var(--paper-dark);
      font-family: 'VT323', monospace;
      font-size: 1rem;
      resize: vertical;
    }

    .clue-item.selected .clue-text {
      background: var(--paper-darker);
      color: var(--paper-light);
      border-color: var(--paper-light);
    }

    .editor-footer {
      padding: 1.5rem;
      background: var(--paper-light);
      border: 2px solid var(--paper-border);
      box-shadow: 4px 4px 8px var(--paper-shadow);
    }

    .validation-status {
      text-align: center;
      margin-bottom: 1rem;
      padding: 1rem;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.7rem;
      line-height: 1.4;
      white-space: pre-line;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .validation-status.valid {
      background: #4a7c59;
      color: var(--paper-light);
    }

    .validation-status.invalid {
      background: #7c4a4a;
      color: var(--paper-light);
    }

    .footer-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .btn {
      font-family: 'Press Start 2P', monospace;
      font-size: 0.7rem;
      padding: 0.75rem 1.5rem;
      border: 2px solid var(--paper-border);
      background: var(--paper-light);
      color: var(--paper-dark);
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn:hover:not(:disabled) {
      background: var(--paper-dark);
      color: var(--paper-light);
      transform: translateY(-2px);
      box-shadow: 4px 4px 8px var(--paper-shadow);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--paper-dark);
      color: var(--paper-light);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--paper-darker);
    }

    .btn-secondary {
      background: var(--paper-light);
      color: var(--paper-dark);
    }

    @media (max-width: 768px) {
      .editor-main {
        grid-template-columns: 1fr;
      }

      .header-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .grid-cell {
        width: 30px;
        height: 30px;
        font-size: 1rem;
      }

      .cell-number {
        font-size: 0.5rem;
      }
    }
  `]
})
export class PuzzleEditorComponent implements OnInit {
  @Input() puzzleId: number = 0;
  @Output() puzzleSubmitted = new EventEmitter<void>();

  puzzleTitle = '';
  gridSize = 15;
  grid: GridCell[] = [];
  selectedCell: number | null = null;
  selectedClue: number | null = null;
  activeTab: 'across' | 'down' = 'across';
  acrossClues: Clue[] = [];
  downClues: Clue[] = [];
  isValid = false;
  validationMessage = 'GRID INCOMPLETE';
  isEditing = false;
  private titleChangeTimeout: any;

  get gridTemplate(): string {
    return `repeat(${this.gridSize}, 1fr)`;
  }

  constructor(
    private puzzleService: PuzzleService
  ) { }

  ngOnInit(): void {
    if (this.puzzleId > 0) {
      this.isEditing = true;
      this.loadPuzzle();
    } else {
      this.initializeGrid();
    }
  }

  loadPuzzle(): void {
    this.puzzleService.getPuzzleById(this.puzzleId).subscribe({
      next: (puzzle) => {
        this.puzzleTitle = puzzle.title;
        this.gridSize = Math.sqrt(puzzle.grid.length);
        this.grid = puzzle.grid;
        this.autoNumber();
        this.validateGrid();
      },
      error: (error) => {
        console.error('Error loading puzzle:', error);
        this.initializeGrid();
      }
    });
  }

  initializeGrid(): void {
    this.grid = [];
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      this.grid.push({
        letter: '',
        isBlack: false
      });
    }
    this.validateGrid();
  }

  resizeGrid(): void {
    if (this.gridSize < 5) this.gridSize = 5;
    if (this.gridSize > 25) this.gridSize = 25;
    this.initializeGrid();
  }

  clearGrid(): void {
    this.grid.forEach(cell => {
      cell.letter = '';
      cell.isBlack = false;
      cell.number = undefined;
      cell.acrossClue = undefined;
      cell.downClue = undefined;
    });
    this.acrossClues = [];
    this.downClues = [];
    this.validateGrid();
  }

  selectCell(index: number): void {
    this.selectedCell = index;
    if (!this.grid[index].isBlack) {
      // Focus the cell for keyboard input
      setTimeout(() => {
        const cellElement = document.querySelector(`.grid-cell:nth-child(${index + 1})`) as HTMLElement;
        if (cellElement) cellElement.focus();
      }, 0);
    }
  }

  handleKeyPress(event: KeyboardEvent, index: number): void {
    if (this.grid[index].isBlack) return;

    if (event.key === 'Backspace') {
      this.grid[index].letter = '';
      // Move to previous cell
      if (index > 0) this.selectCell(index - 1);
    } else if (event.key === 'Delete') {
      this.grid[index].letter = '';
    } else if (event.key === 'Tab') {
      event.preventDefault();
      // Move to next cell
      if (index < this.grid.length - 1) this.selectCell(index + 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.selectCell(index - 1);
    } else if (event.key === 'ArrowRight' && index < this.grid.length - 1) {
      this.selectCell(index + 1);
    } else if (event.key === 'ArrowUp' && index >= this.gridSize) {
      this.selectCell(index - this.gridSize);
    } else if (event.key === 'ArrowDown' && index < this.grid.length - this.gridSize) {
      this.selectCell(index + this.gridSize);
    } else if (event.key.length === 1 && /^[A-Za-z]$/.test(event.key)) {
      this.grid[index].letter = event.key.toUpperCase();
      // Move to next cell
      if (index < this.grid.length - 1) this.selectCell(index + 1);
    }

    // Auto-number whenever grid content changes
    this.autoNumber();

    // Check if all boxes are filled and auto-validate
    this.checkIfAllBoxesFilled();
  }

  checkIfAllBoxesFilled(): void {
    // Count filled white squares
    const whiteSquares = this.grid.filter(cell => !cell.isBlack);
    const filledSquares = whiteSquares.filter(cell => cell.letter !== '');

    console.log(`Boxes filled: ${filledSquares.length}/${whiteSquares.length}`);

    // If all white squares are filled, automatically run comprehensive check
    if (filledSquares.length === whiteSquares.length && whiteSquares.length > 0) {
      console.log('🎉 All boxes filled! Running automatic validation...');
      this.checkPuzzle();
    }
  }

  toggleBlackSquare(): void {
    if (this.selectedCell !== null) {
      this.grid[this.selectedCell].isBlack = !this.grid[this.selectedCell].isBlack;
      if (this.grid[this.selectedCell].isBlack) {
        this.grid[this.selectedCell].letter = '';
        this.grid[this.selectedCell].number = undefined;
      }
      // Auto-number whenever grid structure changes
      this.autoNumber();
    }
  }

  autoNumber(): void {
    let number = 1;
    this.grid.forEach((cell, index) => {
      if (!cell.isBlack) {
        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;

        // Check if this cell should be numbered (start of across or down word)
        const shouldNumber =
          (col === 0 || this.grid[index - 1].isBlack) || // Start of across word
          (row === 0 || this.grid[index - this.gridSize].isBlack); // Start of down word

        if (shouldNumber) {
          cell.number = number++;
        } else {
          cell.number = undefined;
        }
      } else {
        cell.number = undefined;
      }
    });
    this.generateClues();
    this.validateGrid(); // Validate after auto-numbering
  }

  generateClues(): void {
    this.acrossClues = [];
    this.downClues = [];

    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].number) {
        const row = Math.floor(i / this.gridSize);
        const col = i % this.gridSize;

        // Generate across clue
        if (col === 0 || this.grid[i - 1].isBlack) {
          let answer = '';
          let currentCol = col;
          while (currentCol < this.gridSize && !this.grid[row * this.gridSize + currentCol].isBlack) {
            answer += this.grid[row * this.gridSize + currentCol].letter || '?';
            currentCol++;
          }
          if (answer.length > 1) {
            this.acrossClues.push({
              number: this.grid[i].number!,
              clue: '',
              answer: answer,
              direction: 'across'
            });
          }
        }

        // Generate down clue
        if (row === 0 || this.grid[i - this.gridSize].isBlack) {
          let answer = '';
          let currentRow = row;
          while (currentRow < this.gridSize && !this.grid[currentRow * this.gridSize + col].isBlack) {
            answer += this.grid[currentRow * this.gridSize + col].letter || '?';
            currentRow++;
          }
          if (answer.length > 1) {
            this.downClues.push({
              number: this.grid[i].number!,
              clue: '',
              answer: answer,
              direction: 'down'
            });
          }
        }
      }
    }
  }

  selectClue(index: number, direction: 'across' | 'down'): void {
    this.selectedClue = index;
    this.activeTab = direction;
  }

  updateClue(index: number, direction: 'across' | 'down'): void {
    // This method is called when a clue is updated
    this.validateGrid();

    // Check if all clues are now filled and trigger comprehensive check
    this.checkIfAllCluesFilled();
  }

  checkIfAllCluesFilled(): void {
    // Check if all clues that have actual letters also have clue text
    const allClues = [...this.acrossClues, ...this.downClues];
    const cluesWithLetters = allClues.filter(clue =>
      clue.answer.replace(/\?/g, '').length > 0
    );
    const filledClues = cluesWithLetters.filter(clue =>
      clue.clue.trim() !== ''
    );

    // If all clues with letters are filled and we have a title, run comprehensive check
    if (filledClues.length === cluesWithLetters.length &&
      cluesWithLetters.length > 0 &&
      this.puzzleTitle.trim() !== '') {
      console.log('All clues filled! Running comprehensive validation...');
      this.checkPuzzle();
    }
  }

  validateGrid(): void {
    // Check if grid has content
    const hasContent = this.grid.some(cell => !cell.isBlack && cell.letter !== '');
    const hasClues = this.acrossClues.length > 0 || this.downClues.length > 0;
    const hasTitle = this.puzzleTitle.trim() !== '';

    // Check if all clues have text - only check clues that have answers with actual letters
    const allCluesFilled = [...this.acrossClues, ...this.downClues].every(clue => {
      // Only require clue text if the answer has actual letters (not just '?')
      const hasActualLetters = clue.answer.replace(/\?/g, '').length > 0;
      return !hasActualLetters || clue.clue.trim() !== '';
    });

    if (!hasContent) {
      this.isValid = false;
      this.validationMessage = 'GRID HAS NO CONTENT';
    } else if (!hasClues) {
      this.isValid = false;
      this.validationMessage = 'NO CLUES GENERATED - ADD LETTERS TO GRID';
    } else if (!allCluesFilled) {
      this.isValid = false;
      this.validationMessage = 'ALL CLUES WITH LETTERS MUST BE FILLED';
    } else if (!hasTitle) {
      this.isValid = false;
      this.validationMessage = 'PUZZLE TITLE REQUIRED';
    } else {
      this.isValid = true;
      this.validationMessage = 'PUZZLE READY TO PUBLISH';
    }
  }

  saveDraft(): void {
    // TODO: Implement draft saving
    console.log('Saving draft...');
  }

  showMessage(message: string, isError: boolean = false): void {
    this.validationMessage = message;
    this.isValid = !isError;

    // Auto-clear success messages after 3 seconds
    if (!isError) {
      setTimeout(() => {
        if (this.validationMessage === message) {
          this.validateGrid(); // Restore normal validation state
        }
      }, 3000);
    }
  }

  submitPuzzle(): void {
    if (!this.isValid) {
      this.showMessage('❌ PUZZLE NOT READY - FIX VALIDATION ISSUES FIRST', true);
      return;
    }

    // Show loading message
    this.showMessage('🔄 PUBLISHING PUZZLE...', false);

    // Prepare the puzzle data
    const puzzleData = {
      title: this.puzzleTitle,
      grid: this.grid,
      clues: {
        across: this.acrossClues,
        down: this.downClues
      },
      solution: Array.from({ length: this.gridSize }, (_, row) =>
        Array.from({ length: this.gridSize }, (_, col) => {
          const cell = this.grid[row * this.gridSize + col];
          return cell.isBlack ? '#' : cell.letter;
        })
      )
    };

    if (this.isEditing) {
      // Update existing puzzle
      this.puzzleService.updatePuzzle(this.puzzleId, puzzleData).subscribe({
        next: (response) => {
          console.log('Puzzle updated successfully:', response);
          this.showMessage('✅ PUZZLE UPDATED SUCCESSFULLY!', false);
          this.puzzleSubmitted.emit();
        },
        error: (error) => {
          console.error('Error updating puzzle:', error);
          this.showMessage('❌ FAILED TO UPDATE PUZZLE - PLEASE TRY AGAIN', true);
        }
      });
    } else {
      // Create new puzzle
      this.puzzleService.createPuzzle(puzzleData).subscribe({
        next: (response) => {
          console.log('Puzzle created successfully:', response);
          this.showMessage('✅ PUZZLE PUBLISHED SUCCESSFULLY!', false);
          this.puzzleSubmitted.emit();
        },
        error: (error) => {
          console.error('Error creating puzzle:', error);
          this.showMessage('❌ FAILED TO PUBLISH PUZZLE - PLEASE TRY AGAIN', true);
        }
      });
    }
  }

  checkPuzzle(): void {
    // Run validation first
    this.validateGrid();

    // Provide detailed feedback
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check title
    if (!this.puzzleTitle.trim()) {
      issues.push('❌ PUZZLE TITLE IS REQUIRED');
    } else if (this.puzzleTitle.trim().length < 3) {
      suggestions.push('💡 CONSIDER A LONGER, MORE DESCRIPTIVE TITLE');
    }

    // Check grid content
    const hasContent = this.grid.some(cell => !cell.isBlack && cell.letter !== '');
    if (!hasContent) {
      issues.push('❌ GRID HAS NO LETTERS - ADD WORDS TO THE GRID');
    } else {
      // Count words and letters
      const letters = this.grid.filter(cell => !cell.isBlack && cell.letter !== '').length;
      const totalWhiteSquares = this.grid.filter(cell => !cell.isBlack).length;
      const fillPercentage = (letters / totalWhiteSquares) * 100;

      if (fillPercentage < 50) {
        suggestions.push('💡 GRID IS LESS THAN 50% FILLED - CONSIDER ADDING MORE WORDS');
      }
    }

    // Check clues
    if (this.acrossClues.length === 0 && this.downClues.length === 0) {
      issues.push('❌ NO CLUES GENERATED - ADD LETTERS TO CREATE WORDS');
    } else {
      // Check for empty clues
      const emptyAcrossClues = this.acrossClues.filter(clue =>
        clue.answer.replace(/\?/g, '').length > 0 && clue.clue.trim() === ''
      );
      const emptyDownClues = this.downClues.filter(clue =>
        clue.answer.replace(/\?/g, '').length > 0 && clue.clue.trim() === ''
      );

      if (emptyAcrossClues.length > 0) {
        issues.push(`❌ ${emptyAcrossClues.length} ACROSS CLUE(S) NEED TEXT`);
      }
      if (emptyDownClues.length > 0) {
        issues.push(`❌ ${emptyDownClues.length} DOWN CLUE(S) NEED TEXT`);
      }

      // Check clue quality
      const shortClues = [...this.acrossClues, ...this.downClues].filter(clue =>
        clue.clue.trim().length < 10 && clue.clue.trim() !== ''
      );
      if (shortClues.length > 0) {
        suggestions.push('💡 SOME CLUES ARE VERY SHORT - CONSIDER MAKING THEM MORE DESCRIPTIVE');
      }
    }

    // Check grid structure
    const blackSquares = this.grid.filter(cell => cell.isBlack).length;
    const totalSquares = this.grid.length;
    const blackPercentage = (blackSquares / totalSquares) * 100;

    if (blackPercentage > 20) {
      suggestions.push('⚠️ TOO MANY BLACK SQUARES - CONSIDER REDUCING');
    } else if (blackPercentage < 5) {
      suggestions.push('⚠️ VERY FEW BLACK SQUARES - CONSIDER ADDING MORE');
    }

    // Check for symmetry (basic check)
    const isSymmetric = this.checkSymmetry();
    if (!isSymmetric) {
      suggestions.push('💡 GRID IS NOT SYMMETRIC - CROSSWORDS ARE TYPICALLY SYMMETRIC');
    }

    // Show results
    if (issues.length === 0) {
      let message = '✅ PUZZLE LOOKS GREAT! READY TO PUBLISH!';
      if (suggestions.length > 0) {
        message += '\n\n' + suggestions.join('\n');
      }
      this.validationMessage = message;
      this.isValid = true;
    } else {
      let message = issues.join('\n');
      if (suggestions.length > 0) {
        message += '\n\n' + suggestions.join('\n');
      }
      this.validationMessage = message;
      this.isValid = false;
    }

    // Log detailed info to console for debugging
    console.log('Puzzle Check Results:', {
      title: this.puzzleTitle,
      hasContent,
      acrossClues: this.acrossClues.length,
      downClues: this.downClues.length,
      blackSquares,
      totalSquares,
      blackPercentage: blackPercentage.toFixed(1) + '%',
      isSymmetric,
      issues,
      suggestions
    });
  }

  checkSymmetry(): boolean {
    // Basic symmetry check - check if the grid is rotationally symmetric
    const size = this.gridSize;
    for (let i = 0; i < this.grid.length; i++) {
      const row = Math.floor(i / size);
      const col = i % size;
      const oppositeRow = size - 1 - row;
      const oppositeCol = size - 1 - col;
      const oppositeIndex = oppositeRow * size + oppositeCol;

      if (this.grid[i].isBlack !== this.grid[oppositeIndex].isBlack) {
        return false;
      }
    }
    return true;
  }

  onTitleChange(): void {
    // Clear any existing timeout
    if (this.titleChangeTimeout) {
      clearTimeout(this.titleChangeTimeout);
    }

    // Set a timeout to validate after user stops typing
    this.titleChangeTimeout = setTimeout(() => {
      this.validateGrid();
      this.checkIfPuzzleComplete();
    }, 500);
  }

  checkIfPuzzleComplete(): void {
    // Check if all components are complete
    const hasTitle = this.puzzleTitle.trim() !== '';
    const hasContent = this.grid.some(cell => !cell.isBlack && cell.letter !== '');

    if (hasTitle && hasContent) {
      // Check if all clues are filled
      const allClues = [...this.acrossClues, ...this.downClues];
      const cluesWithLetters = allClues.filter(clue =>
        clue.answer.replace(/\?/g, '').length > 0
      );
      const filledClues = cluesWithLetters.filter(clue =>
        clue.clue.trim() !== ''
      );

      // If everything is complete, run comprehensive check
      if (filledClues.length === cluesWithLetters.length && cluesWithLetters.length > 0) {
        console.log('Puzzle appears complete! Running comprehensive validation...');
        this.checkPuzzle();
      }
    }
  }
} 