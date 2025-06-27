import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { PuzzleEditorComponent } from './puzzle-editor.component';
import { PuzzleService } from '../../services/puzzle.service';

describe('PuzzleEditorComponent', () => {
    let component: PuzzleEditorComponent;
    let fixture: ComponentFixture<PuzzleEditorComponent>;
    let puzzleService: jasmine.SpyObj<PuzzleService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('PuzzleService', [
            'getPuzzleById',
            'createPuzzle',
            'updatePuzzle'
        ]);

        await TestBed.configureTestingModule({
            imports: [PuzzleEditorComponent, FormsModule, HttpClientTestingModule],
            providers: [
                { provide: PuzzleService, useValue: spy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PuzzleEditorComponent);
        component = fixture.componentInstance;
        puzzleService = TestBed.inject(PuzzleService) as jasmine.SpyObj<PuzzleService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.puzzleTitle).toBe('');
        expect(component.gridSize).toBe(15);
        expect(component.grid.length).toBe(225); // 15x15
        expect(component.selectedCell).toBe(null);
        expect(component.isValid).toBe(false);
        expect(component.validationMessage).toBe('GRID HAS NO CONTENT');
    });

    describe('Grid Management', () => {
        it('should initialize grid correctly', () => {
            component.initializeGrid();
            expect(component.grid.length).toBe(225); // 15x15
            expect(component.grid.every(cell => !cell.isBlack && cell.letter === '')).toBe(true);
        });

        it('should resize grid correctly', () => {
            component.gridSize = 5;
            component.resizeGrid();
            expect(component.grid.length).toBe(25); // 5x5
        });

        it('should clear grid correctly', () => {
            // Set some non-default values
            component.grid[0].letter = 'A';
            component.grid[1].isBlack = true;
            component.grid[2].letter = 'B';
            component.grid[3].isBlack = true;
            component.clearGrid();
            expect(component.grid.every(cell => !cell.isBlack && cell.letter === '')).toBe(true);
            expect(component.validationMessage).toBe('GRID HAS NO CONTENT');
        });
    });

    describe('Cell Selection and Input', () => {
        beforeEach(() => {
            component.initializeGrid();
        });

        it('should select cell correctly', () => {
            component.selectCell(5);
            expect(component.selectedCell).toBe(5);
        });

        it('should handle key press correctly', () => {
            component.selectCell(0);
            const event = new KeyboardEvent('keydown', { key: 'A' });

            component.handleKeyPress(event, 0);

            expect(component.grid[0].letter).toBe('A');
            expect(component.selectedCell).toBe(1); // Should move to next cell
        });

        it('should toggle black square correctly', () => {
            component.selectCell(0);
            component.toggleBlackSquare();

            expect(component.grid[0].isBlack).toBe(true);
            expect(component.grid[0].letter).toBe('');
        });
    });

    describe('Auto-numbering and Clue Generation', () => {
        beforeEach(() => {
            component.gridSize = 3;
            component.initializeGrid();
        });

        it('should auto-number cells correctly', () => {
            // Add some letters to create words
            component.grid[0].letter = 'C';
            component.grid[1].letter = 'A';
            component.grid[2].letter = 'T';
            component.grid[3].letter = 'D';
            component.grid[6].letter = 'O';
            component.grid[9].letter = 'G';
            component.autoNumber();
            component.generateClues();
            // Should have numbered cells at the start of words
            expect(component.grid[0].number).toBe(1); // Start of "CAT"
            expect(component.grid[3].number).toBe(2); // Start of "DOG"
        });

        it('should generate clues correctly', () => {
            // Create a simple word
            component.grid[0].letter = 'C';
            component.grid[1].letter = 'A';
            component.grid[2].letter = 'T';
            component.autoNumber();
            component.generateClues();
            expect(component.acrossClues.length).toBe(1);
            expect(component.acrossClues[0].answer).toBe('CAT');
            expect(component.acrossClues[0].number).toBe(1);
        });
    });

    describe('Validation', () => {
        beforeEach(() => {
            component.initializeGrid();
        });

        it('should validate empty grid correctly', () => {
            component.validateGrid();
            expect(component.isValid).toBe(false);
            expect(component.validationMessage).toBe('GRID HAS NO CONTENT');
        });

        it('should validate grid with content but no title', () => {
            component.grid[0].letter = 'A';
            component.autoNumber();
            component.generateClues();
            component.validateGrid();
            expect(component.isValid).toBe(false);
            expect(component.validationMessage).toBe('ALL CLUES WITH LETTERS MUST BE FILLED');
        });

        it('should validate complete puzzle correctly', () => {
            // Create a simple valid puzzle
            component.puzzleTitle = 'Test Puzzle';
            component.grid[0].letter = 'C';
            component.grid[1].letter = 'A';
            component.grid[2].letter = 'T';
            component.autoNumber();
            component.generateClues();
            // Add clues for all words
            component.acrossClues.forEach(clue => clue.clue = 'Feline pet');
            component.downClues.forEach(clue => clue.clue = 'Animal');
            component.validateGrid();
            expect(component.isValid).toBe(true);
            expect(component.validationMessage).toBe('PUZZLE READY TO PUBLISH');
        });
    });

    describe('Check Puzzle Functionality', () => {
        beforeEach(() => {
            component.initializeGrid();
        });

        it('should provide detailed feedback for incomplete puzzle', () => {
            component.checkPuzzle();
            expect(component.isValid).toBe(false);
            expect(component.validationMessage).toContain('❌ PUZZLE TITLE IS REQUIRED');
            expect(component.validationMessage).toContain('❌ GRID HAS NO LETTERS');
        });

        it('should provide suggestions for improvement', () => {
            component.puzzleTitle = 'Test';
            component.grid[0].letter = 'A';
            component.autoNumber();
            component.generateClues();
            if (component.acrossClues.length > 0) {
                component.acrossClues[0].clue = 'Short';
            }
            component.checkPuzzle();
            expect(component.validationMessage).toContain('💡 SOME CLUES ARE VERY SHORT');
        });

        it('should check symmetry correctly', () => {
            component.gridSize = 3;
            component.initializeGrid();

            // Create a symmetric grid
            component.grid[0].isBlack = true;
            component.grid[2].isBlack = true;
            component.grid[6].isBlack = true;
            component.grid[8].isBlack = true;

            expect(component.checkSymmetry()).toBe(true);
        });
    });

    describe('Automatic Checking', () => {
        beforeEach(() => {
            component.initializeGrid();
        });

        it('should detect when all boxes are filled', () => {
            // Fill all white squares
            component.grid.forEach((cell, index) => {
                if (!cell.isBlack) {
                    cell.letter = 'A';
                }
            });

            spyOn(component, 'checkPuzzle');
            component.checkIfAllBoxesFilled();

            expect(component.checkPuzzle).toHaveBeenCalled();
        });

        it('should detect when all clues are filled', () => {
            component.puzzleTitle = 'Test';
            component.grid[0].letter = 'A';
            component.autoNumber();
            component.generateClues();
            component.acrossClues.forEach(clue => clue.clue = 'Test clue');
            component.downClues.forEach(clue => clue.clue = 'Test clue');
            spyOn(component, 'checkPuzzle');
            component.checkIfAllCluesFilled();
            expect(component.checkPuzzle).toHaveBeenCalled();
        });
    });

    describe('Puzzle Submission', () => {
        beforeEach(() => {
            component.initializeGrid();
            component.puzzleTitle = 'Test Puzzle';
            component.grid[0].letter = 'A';
            component.autoNumber();
            component.generateClues();
            component.acrossClues.forEach(clue => clue.clue = 'Test clue');
            component.downClues.forEach(clue => clue.clue = 'Test clue');
            component.validateGrid();
        });

        it('should submit new puzzle successfully', () => {
            const mockPuzzle = {
                id: 1,
                title: 'Test Puzzle',
                grid: [],
                clues: { across: [], down: [] },
                solution: [],
                authorID: 1,
                created: new Date().toISOString()
            };
            puzzleService.createPuzzle.and.returnValue(of(mockPuzzle));
            spyOn(component.puzzleSubmitted, 'emit');

            component.submitPuzzle();

            expect(puzzleService.createPuzzle).toHaveBeenCalled();
            expect(component.puzzleSubmitted.emit).toHaveBeenCalled();
        });

        it('should handle submission error', () => {
            puzzleService.createPuzzle.and.returnValue(throwError(() => new Error('Network error')));

            component.submitPuzzle();

            expect(component.validationMessage).toContain('❌ FAILED TO PUBLISH PUZZLE');
        });

        it('should not submit invalid puzzle', () => {
            component.isValid = false;
            spyOn(component, 'showMessage');

            component.submitPuzzle();

            expect(puzzleService.createPuzzle).not.toHaveBeenCalled();
            expect(component.showMessage).toHaveBeenCalledWith(
                '❌ PUZZLE NOT READY - FIX VALIDATION ISSUES FIRST',
                true
            );
        });
    });

    describe('Message Display', () => {
        it('should show messages correctly', () => {
            component.showMessage('Test message', false);

            expect(component.validationMessage).toBe('Test message');
            expect(component.isValid).toBe(true);
        });

        it('should show error messages correctly', () => {
            component.showMessage('Error message', true);

            expect(component.validationMessage).toBe('Error message');
            expect(component.isValid).toBe(false);
        });
    });
}); 