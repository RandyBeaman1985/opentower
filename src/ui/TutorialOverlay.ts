/**
 * TutorialOverlay - First-time player onboarding
 * 
 * Shows on first launch, explains core loop and controls.
 * Can be skipped, reopened with ? button.
 */

const TUTORIAL_STORAGE_KEY = 'opentower_tutorial_completed';

export class TutorialOverlay {
  private overlay: HTMLDivElement;
  private currentStep: number = 0;
  private totalSteps: number = 4;
  private onComplete: (() => void) | null = null;

  constructor() {
    this.overlay = this.createOverlay();
    document.body.appendChild(this.overlay);
  }

  /** Check if tutorial has been completed before */
  static hasCompletedTutorial(): boolean {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
  }

  /** Mark tutorial as completed */
  static markCompleted(): void {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  }

  /** Reset tutorial (for testing) */
  static resetTutorial(): void {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  }

  /** Show tutorial overlay */
  show(): void {
    this.currentStep = 0;
    this.overlay.style.display = 'flex';
    this.renderStep();
  }

  /** Hide tutorial overlay */
  hide(): void {
    this.overlay.style.display = 'none';
  }

  /** Set callback for when tutorial is completed */
  setOnComplete(callback: () => void): void {
    this.onComplete = callback;
  }

  /** Create the overlay DOM structure */
  private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: monospace;
    `;
    return overlay;
  }

  /** Render current tutorial step */
  private renderStep(): void {
    const steps = [
      this.createWelcomeStep(),
      this.createCoreLoopStep(),
      this.createElevatorStep(),
      this.createControlsStep(),
    ];

    this.overlay.innerHTML = '';
    this.overlay.appendChild(steps[this.currentStep]!);
  }

  /** Step 1: Welcome */
  private createWelcomeStep(): HTMLDivElement {
    const step = document.createElement('div');
    step.style.cssText = `
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 40px;
      border-radius: 12px;
      max-width: 600px;
      text-align: center;
      color: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    step.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🏢</div>
      <h1 style="font-size: 32px; margin: 0 0 20px 0;">Welcome to OpenTower!</h1>
      <p style="font-size: 18px; line-height: 1.6; opacity: 0.9; margin-bottom: 30px;">
        Build the ultimate skyscraper and manage thousands of tenants.
        <br><br>
        Your goal: <strong>Grow from 1★ to 3★ rating</strong> by attracting people,
        keeping them happy, and turning a profit.
      </p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="tutorial-skip" style="
          padding: 12px 24px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
        ">Skip Tutorial</button>
        <button id="tutorial-next" style="
          padding: 12px 24px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
          font-weight: bold;
        ">Let's Go! →</button>
      </div>
    `;

    this.attachStepListeners(step);
    return step;
  }

  /** Step 2: Core Loop */
  private createCoreLoopStep(): HTMLDivElement {
    const step = document.createElement('div');
    step.style.cssText = `
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 40px;
      border-radius: 12px;
      max-width: 600px;
      color: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    step.innerHTML = `
      <h2 style="font-size: 24px; margin: 0 0 20px 0; text-align: center;">The Core Loop</h2>
      <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="
            min-width: 50px;
            height: 50px;
            background: #4169e1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          ">🏢</div>
          <div>
            <strong style="font-size: 16px;">1. Build Offices</strong>
            <div style="opacity: 0.8; font-size: 14px; margin-top: 4px;">
              Select "Office" from the menu, click to place. Costs $40,000 each.
            </div>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="
            min-width: 50px;
            height: 50px;
            background: #10b981;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          ">👔</div>
          <div>
            <strong style="font-size: 16px;">2. Workers Arrive</strong>
            <div style="opacity: 0.8; font-size: 14px; margin-top: 4px;">
              6 workers spawn per office. They arrive at 8 AM, leave at 5 PM.
            </div>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="
            min-width: 50px;
            height: 50px;
            background: #f59e0b;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          ">💰</div>
          <div>
            <strong style="font-size: 16px;">3. Earn Income</strong>
            <div style="opacity: 0.8; font-size: 14px; margin-top: 4px;">
              Offices generate $10,000 per quarter (every 15 game-minutes).
            </div>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="tutorial-back" style="
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
        ">← Back</button>
        <button id="tutorial-skip" style="
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
        ">Skip</button>
        <button id="tutorial-next" style="
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
          font-weight: bold;
        ">Next →</button>
      </div>
      <div style="text-align: center; margin-top: 15px; font-size: 12px; opacity: 0.5;">
        Step 2 of ${this.totalSteps}
      </div>
    `;

    this.attachStepListeners(step);
    return step;
  }

  /** Step 3: Elevator System */
  private createElevatorStep(): HTMLDivElement {
    const step = document.createElement('div');
    step.style.cssText = `
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 40px;
      border-radius: 12px;
      max-width: 600px;
      color: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    step.innerHTML = `
      <h2 style="font-size: 24px; margin: 0 0 10px 0; text-align: center;">⚠️ The Elevator Challenge</h2>
      <p style="font-size: 16px; text-align: center; opacity: 0.9; margin-bottom: 30px;">
        This is the core puzzle of OpenTower!
      </p>
      
      <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Why Elevators Matter:</div>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Workers need elevators to reach upper floors</li>
          <li>Long waits = stressed workers (they turn <span style="color: #dc143c;">red</span>)</li>
          <li>Stressed workers leave = no income!</li>
        </ul>
      </div>

      <div style="background: rgba(16, 185, 129, 0.15); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #10b981;">How to Place Elevators:</div>
        <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Select <strong>"Standard Elevator"</strong> from menu (bottom section)</li>
          <li><strong>Click</strong> to set horizontal position</li>
          <li><strong>Drag vertically</strong> to set shaft height</li>
          <li><strong>Release</strong> to place (cost shown during drag)</li>
        </ol>
        <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 4px; font-size: 14px;">
          💡 <strong>Tip:</strong> Start with one elevator covering floors 1-10 (~$920K)
        </div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="tutorial-back" style="
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
        ">← Back</button>
        <button id="tutorial-skip" style="
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
        ">Skip</button>
        <button id="tutorial-next" style="
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
          font-weight: bold;
        ">Next →</button>
      </div>
      <div style="text-align: center; margin-top: 15px; font-size: 12px; opacity: 0.5;">
        Step 3 of ${this.totalSteps}
      </div>
    `;

    this.attachStepListeners(step);
    return step;
  }

  /** Step 4: Controls & Start */
  private createControlsStep(): HTMLDivElement {
    const step = document.createElement('div');
    step.style.cssText = `
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 40px;
      border-radius: 12px;
      max-width: 600px;
      color: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    step.innerHTML = `
      <h2 style="font-size: 24px; margin: 0 0 20px 0; text-align: center;">Controls & Tips</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">🖱️ Mouse</div>
          <div style="font-size: 14px; opacity: 0.9; line-height: 1.6;">
            • Click to place buildings<br>
            • Drag to pan camera<br>
            • Scroll to zoom
          </div>
        </div>
        
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">⌨️ Keyboard</div>
          <div style="font-size: 14px; opacity: 0.9; line-height: 1.6;">
            • 1-9: Quick-select buildings<br>
            • 0-4: Speed control<br>
            • Ctrl+D: Toggle debug
          </div>
        </div>
      </div>

      <div style="background: rgba(16, 185, 129, 0.15); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #10b981;">Your First Tower:</div>
        <ol style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
          <li>Place 2-3 offices on different floors</li>
          <li>Place an elevator covering those floors</li>
          <li>Click "+ Spawn Workers" to test</li>
          <li>Watch Tower Pulse (top-right) for health metrics</li>
          <li>Keep mood above 50% to avoid losing workers!</li>
        </ol>
      </div>

      <div style="text-align: center; font-size: 14px; opacity: 0.8; margin-bottom: 20px;">
        💡 Press <strong>?</strong> anytime to see this tutorial again
      </div>

      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="tutorial-back" style="
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 14px;
        ">← Back</button>
        <button id="tutorial-complete" style="
          padding: 12px 32px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: monospace;
          font-size: 16px;
          font-weight: bold;
        ">Start Building! 🚀</button>
      </div>
      <div style="text-align: center; margin-top: 15px; font-size: 12px; opacity: 0.5;">
        Step 4 of ${this.totalSteps}
      </div>
    `;

    this.attachStepListeners(step);
    return step;
  }

  /** Attach event listeners to step buttons */
  private attachStepListeners(step: HTMLDivElement): void {
    setTimeout(() => {
      const nextBtn = step.querySelector('#tutorial-next');
      const backBtn = step.querySelector('#tutorial-back');
      const skipBtn = step.querySelector('#tutorial-skip');
      const completeBtn = step.querySelector('#tutorial-complete');

      nextBtn?.addEventListener('click', () => this.nextStep());
      backBtn?.addEventListener('click', () => this.prevStep());
      skipBtn?.addEventListener('click', () => this.skip());
      completeBtn?.addEventListener('click', () => this.complete());
    }, 0);
  }

  /** Go to next step */
  private nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.renderStep();
    }
  }

  /** Go to previous step */
  private prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  }

  /** Skip tutorial */
  private skip(): void {
    TutorialOverlay.markCompleted();
    this.hide();
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /** Complete tutorial */
  private complete(): void {
    TutorialOverlay.markCompleted();
    this.hide();
    if (this.onComplete) {
      this.onComplete();
    }
    console.log('Tutorial completed! Welcome to OpenTower 🏢');
  }
}
