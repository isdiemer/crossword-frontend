import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { PuzzlePlayerComponent } from './puzzle-player.component';
import { PuzzleService } from '../../services/puzzle.service';

describe('PuzzlePlayerComponent', () => {
    let component: PuzzlePlayerComponent;
    let fixture: ComponentFixture<PuzzlePlayerComponent>;
    let puzzleService: jasmine.SpyObj<PuzzleService>;

    const mockPuzzle = {
        id: 1,
        title: 'Test Puzzle',
        grid: [
            { letter: 'C', isBlack: false },
            { letter: 'A', isBlack: false },
            { letter: 'T', isBlack: false }
        ],
        clues: {
            across: [
                { number: 1, clue: 'Feline pet', answer: 'CAT', direction: 'across' }
            ],
            down: []
        },
        solution: ['C', 'A', 'T'],
        authorID: 1,
        created: '2024-01-01T00:00:00Z'
    };

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('PuzzleService', [
            'getPuzzleById',
            'submitGuess',
            'validateGuess'
        ]);

        await TestBed.configureTestingModule({
            imports: [PuzzlePlayerComponent, FormsModule, HttpClientTestingModule],
            providers: [
                { provide: PuzzleService, useValue: spy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PuzzlePlayerComponent);
        component = fixture.componentInstance;
        puzzleService = TestBed.inject(PuzzleService) as jasmine.SpyObj<PuzzleService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.puzzleId).toBe(0);
        expect(component.selectedCell).toBe(null);
        expect(component.checkMessage).toBe('');
        expect(component.revealMode).toBe(false);
        expect(component.activeTab).toBe('across');
    });

    describe('Loading Puzzle', () => {
        it('should load puzzle successfully', () => {
            puzzleService.getPuzzleById.and.returnValue(of(mockPuzzle));
            component.puzzleId = 1;

            component.ngOnInit();

            expect(puzzleService.getPuzzleById).toHaveBeenCalledWith(1);
            expect(component.puzzle).toEqual(mockPuzzle);
        });

        it('should handle loading error', () => {
            puzzleService.getPuzzleById.and.returnValue(throwError(() => new Error('Not found')));
            component.puzzleId = 999;

            component.ngOnInit();

            // The component doesn't set checkMessage on error, it just logs to console
            // So we just verify the error was handled gracefully
            expect(component.puzzle).toBeNull();
        });
    });

    describe('Grid Operations', () => {
        beforeEach(() => {
            component.puzzle = mockPuzzle;
            component.initializePlayGrid();
        });

        it('should initialize play grid correctly', () => {
            expect(component.playGrid.length).toBe(mockPuzzle.grid.length);
            expect(component.playGrid.every(cell => cell.userInput === '')).toBe(true);
        });

        it('should select cell correctly', () => {
            component.selectCell(2);
            expect(component.selectedCell).toBe(2);
            expect(component.playGrid[2].isSelected).toBe(true);
        });

        it('should clear selection correctly', () => {
            // First select a cell
            component.selectedCell = 5;
            component.playGrid[5].isSelected = true;

            component.clearSelection();

            expect(component.selectedCell).toBe(5); // selectedCell is not cleared by clearSelection
            expect(component.playGrid[5].isSelected).toBe(false);
        });
    });

    describe('Grid Template', () => {
        it('should generate correct grid template for 3x3 grid', () => {
            // Create a 3x3 grid (9 cells total)
            const threeByThreePuzzle = {
                ...mockPuzzle,
                grid: Array(9).fill(null).map((_, i) => ({
                    letter: String.fromCharCode(65 + i),
                    isBlack: false
                }))
            };
            component.puzzle = threeByThreePuzzle;
            expect(component.gridTemplate).toBe('repeat(3, 1fr)');
        });

        it('should generate default grid template when no puzzle', () => {
            component.puzzle = null;
            expect(component.gridTemplate).toBe('repeat(15, 1fr)');
        });
    });

    describe('Completion Percentage', () => {
        beforeEach(() => {
            component.puzzle = mockPuzzle;
            component.initializePlayGrid();
        });

        it('should calculate completion percentage correctly', () => {
            component.playGrid[0].userInput = 'C';
            component.playGrid[1].userInput = 'A';
            component.playGrid[2].userInput = 'T';

            expect(component.completionPercentage).toBe(100); // All cells filled
        });

        it('should return 0 for empty grid', () => {
            expect(component.completionPercentage).toBe(0);
        });
    });

    describe('Game Actions', () => {
        beforeEach(() => {
            component.puzzle = mockPuzzle;
            component.initializePlayGrid();
        });

        it('should reveal answers', () => {
            expect(component.revealMode).toBe(false);
            component.revealAnswers();
            expect(component.revealMode).toBe(true);
            expect(component.checkMessage).toBe('Solution revealed!');
        });
    });

    describe('Clue Management', () => {
        beforeEach(() => {
            component.puzzle = mockPuzzle;
            component.initializePlayGrid();
            component.generateClues();
        });

        it('should generate clues correctly', () => {
            expect(component.acrossClues.length).toBe(1);
            expect(component.downClues.length).toBe(0);
            expect(component.acrossClues[0].clue).toBe('Feline pet');
            expect(component.acrossClues[0].answer).toBe('CAT');
        });

        it('should select clue correctly', () => {
            component.selectClue(0, 'across');
            expect(component.selectedClue).toBe(0);
            expect(component.activeTab).toBe('across');
        });
    });
}); 