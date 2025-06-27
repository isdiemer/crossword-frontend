import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <div class="about-header">
        <h1 class="about-title">ABOUT CROSSWORD</h1>
        <p class="about-subtitle">A RETRO-STYLE CROSSWORD PUZZLE PLATFORM</p>
      </div>

      <div class="about-content">
        <section class="about-section">
          <h2>OUR MISSION</h2>
          <p>
            CROSSWORD BRINGS THE CLASSIC NEWSPAPER PUZZLE EXPERIENCE INTO THE DIGITAL AGE. 
            WE BELIEVE IN THE POWER OF WORDPLAY TO SHARPEN MINDS AND BRING PEOPLE TOGETHER.
          </p>
        </section>

        <section class="about-section">
          <h2>FEATURES</h2>
          <div class="features-grid">
            <div class="feature-item">
              <h3>DAILY CHALLENGES</h3>
              <p>FRESH PUZZLES EVERY DAY TO KEEP YOUR MIND ACTIVE</p>
            </div>
            <div class="feature-item">
              <h3>CREATE & SHARE</h3>
              <p>BUILD YOUR OWN PUZZLES AND SHARE THEM WITH THE COMMUNITY</p>
            </div>
            <div class="feature-item">
              <h3>PROGRESS TRACKING</h3>
              <p>SAVE YOUR PROGRESS AND COMPETE WITH FRIENDS</p>
            </div>
            <div class="feature-item">
              <h3>MULTIPLE DIFFICULTIES</h3>
              <p>FROM BEGINNER TO EXPERT, THERE'S A PUZZLE FOR EVERYONE</p>
            </div>
          </div>
        </section>
      </div>

      <div class="about-footer">
        <button class="btn btn-primary" (click)="onBackToHome()">BACK TO HOME</button>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .about-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: var(--paper-light);
      border: 2px solid var(--paper-border);
      box-shadow: 4px 4px 8px var(--paper-shadow);
    }

    .about-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--paper-dark);
      font-family: 'Press Start 2P', monospace;
    }

    .about-subtitle {
      font-size: 1.2rem;
      color: var(--paper-darker);
      font-family: 'VT323', monospace;
    }

    .about-content {
      margin-bottom: 3rem;
    }

    .about-section {
      margin-bottom: 3rem;
      padding: 2rem;
      background: var(--paper-light);
      border: 2px solid var(--paper-border);
      box-shadow: 4px 4px 8px var(--paper-shadow);
    }

    .about-section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--paper-dark);
      font-family: 'Press Start 2P', monospace;
      text-align: center;
    }

    .about-section p {
      font-size: 1.1rem;
      line-height: 1.6;
      color: var(--paper-darker);
      font-family: 'VT323', monospace;
      text-align: center;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .feature-item {
      padding: 1.5rem;
      background: var(--paper-lighter);
      border: 1px solid var(--paper-border);
      text-align: center;
    }

    .feature-item h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: var(--paper-dark);
      font-family: 'Press Start 2P', monospace;
    }

    .feature-item p {
      font-size: 1rem;
      color: var(--paper-darker);
      font-family: 'VT323', monospace;
    }

    .about-footer {
      text-align: center;
      padding: 2rem;
    }

    .btn {
      font-family: 'Press Start 2P', monospace;
      font-size: 0.8rem;
      padding: 1rem 2rem;
      border: 2px solid var(--paper-border);
      background: var(--paper-light);
      color: var(--paper-dark);
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn:hover {
      background: var(--paper-dark);
      color: var(--paper-light);
      transform: translateY(-2px);
      box-shadow: 4px 4px 8px var(--paper-shadow);
    }

    .btn-primary {
      background: var(--paper-dark);
      color: var(--paper-light);
    }

    .btn-primary:hover {
      background: var(--paper-darker);
    }

    @media (max-width: 768px) {
      .about-container {
        padding: 1rem;
      }

      .about-title {
        font-size: 2rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AboutComponent {
  @Output() backToHome = new EventEmitter<void>();

  onBackToHome(): void {
    this.backToHome.emit();
  }
} 