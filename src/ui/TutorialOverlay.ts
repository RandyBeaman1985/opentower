/**
 * TutorialOverlay - Interactive first-time player onboarding
 * 
 * Features:
 * - Highlights specific UI elements (BuildingMenu, etc.)
 * - Animated arrows pointing where to click
 * - Step-by-step guidance that progresses with actions
 * - Auto-dismisses after first building placed
 * - Can be skipped or reopened with ? button
 * 
 * Mission: A first-time player should understand how to play within 30 seconds.
 */

const TUTORIAL_STORAGE_KEY = 'opentower_tutorial_completed';

type TutorialStep = 
  | 'welcome'           // Welcome message
  | 'select-lobby'      // Highlight menu, guide to click Lobby
  | 'place-lobby'       // Arrow pointing to ground, guide to place
  | 'complete';         // Tutorial done!

export class TutorialOverlay {
  private overlay: HTMLDivElement;
  private currentStep: TutorialStep = 'welcome';
  private onComplete: (() => void) | null = null;
  private onStepChange: ((step: TutorialStep) => void) | null = null;

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
    this.currentStep = 'welcome';
    this.overlay.style.display = 'block';
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

  /** Set callback for when step changes (so game can react) */
  setOnStepChange(callback: (step: TutorialStep) => void): void {
    this.onStepChange = callback;
  }

  /** Advance to next step (called by game when action is completed) */
  advanceStep(): void {
    switch (this.currentStep) {
      case 'welcome':
        this.currentStep = 'select-lobby';
        break;
      case 'select-lobby':
        this.currentStep = 'place-lobby';
        break;
      case 'place-lobby':
        this.currentStep = 'complete';
        this.complete();
        return;
    }
    
    this.renderStep();
    
    if (this.onStepChange) {
      this.onStepChange(this.currentStep);
    }
  }

  /** Get current tutorial step */
  getCurrentStep(): TutorialStep {
    return this.currentStep;
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
      background: rgba(0, 0, 0, 0.75);
      z-index: 9999;
      display: none;
      pointer-events: none;
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
    `;
    return overlay;
  }

  /** Render current tutorial step */
  private renderStep(): void {
    switch (this.currentStep) {
      case 'welcome':
        this.renderWelcomeStep();
        break;
      case 'select-lobby':
        this.renderSelectLobbyStep();
        break;
      case 'place-lobby':
        this.renderPlaceLobbyStep();
        break;
    }
  }

  /** Step 1: Welcome - quick intro */
  private renderWelcomeStep(): void {
    this.overlay.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        padding: 40px;
        border-radius: 16px;
        max-width: 500px;
        text-align: center;
        color: white;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        pointer-events: auto;
      ">
        <div style="font-size: 64px; margin-bottom: 20px;">🏢</div>
        <h1 style="font-size: 36px; margin: 0 0 16px 0; font-weight: 700;">Welcome to OpenTower!</h1>
        <p style="font-size: 18px; line-height: 1.6; opacity: 0.95; margin-bottom: 32px;">
          Build a skyscraper, manage tenants, earn money.<br>
          <strong>Let's build your first lobby in 30 seconds.</strong>
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="tutorial-skip" style="
            padding: 14px 28px;
            background: rgba(255,255,255,0.15);
            color: white;
            border: 2px solid rgba(255,255,255,0.4);
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.25)'" 
             onmouseout="this.style.background='rgba(255,255,255,0.15)'">
            Skip Tutorial
          </button>
          <button id="tutorial-start" style="
            padding: 14px 32px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 16px;
            font-weight: 700;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(16, 185, 129, 0.5)'" 
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)'">
            Let's Go! 🚀
          </button>
        </div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('tutorial-skip')?.addEventListener('click', () => this.skip());
      document.getElementById('tutorial-start')?.addEventListener('click', () => this.advanceStep());
    }, 0);
  }

  /** Step 2: Select Lobby - highlight building menu */
  private renderSelectLobbyStep(): void {
    this.overlay.innerHTML = `
      <!-- Highlight cutout for building menu -->
      <div id="menu-highlight" style="
        position: absolute;
        right: 8px;
        top: 64px;
        width: 320px;
        height: 600px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
        border-radius: 16px;
        pointer-events: none;
        animation: pulse-highlight 2s ease-in-out infinite;
      "></div>
      
      <!-- Arrow pointing to menu -->
      <div style="
        position: absolute;
        right: 340px;
        top: 150px;
        font-size: 48px;
        animation: bounce-arrow 1s ease-in-out infinite;
        pointer-events: none;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
      ">👉</div>
      
      <!-- Instruction box -->
      <div style="
        position: absolute;
        right: 380px;
        top: 80px;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        padding: 24px;
        border-radius: 12px;
        max-width: 280px;
        color: white;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
        pointer-events: auto;
      ">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">
          Step 1: Select Lobby
        </div>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; opacity: 0.95;">
          Click the <strong>"Special"</strong> tab (⭐), then click <strong>"Lobby"</strong> to select it.
        </p>
        <div style="font-size: 13px; opacity: 0.8; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px;">
          💡 Every tower needs a lobby on the ground floor!
        </div>
        <button id="tutorial-skip-step" style="
          margin-top: 16px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          width: 100%;
        ">Skip Tutorial</button>
      </div>
      
      <style>
        @keyframes pulse-highlight {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 4px rgba(59, 130, 246, 0.6); }
          50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 8px rgba(59, 130, 246, 0.8); }
        }
        
        @keyframes bounce-arrow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
      </style>
    `;

    setTimeout(() => {
      document.getElementById('tutorial-skip-step')?.addEventListener('click', () => this.skip());
    }, 0);
  }

  /** Step 3: Place Lobby - arrow pointing to ground */
  private renderPlaceLobbyStep(): void {
    this.overlay.innerHTML = `
      <!-- Arrow pointing down to ground level -->
      <div style="
        position: absolute;
        left: 50%;
        top: 40%;
        transform: translateX(-50%);
        font-size: 64px;
        animation: bounce-down 1s ease-in-out infinite;
        pointer-events: none;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8));
      ">👇</div>
      
      <!-- Instruction box -->
      <div style="
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        padding: 28px;
        border-radius: 12px;
        max-width: 400px;
        color: white;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
        text-align: center;
        pointer-events: auto;
      ">
        <div style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">
          Step 2: Place the Lobby
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; opacity: 0.95;">
          Click on the <strong>ground floor</strong> (the red line) to place your lobby.
        </p>
        <div style="font-size: 14px; opacity: 0.85; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 6px; margin-bottom: 16px;">
          💡 Look for the <span style="color: #10b981; font-weight: 600;">green preview</span> - that's where your lobby will go!
        </div>
        <button id="tutorial-skip-step" style="
          padding: 10px 20px;
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Skip Tutorial</button>
      </div>
      
      <style>
        @keyframes bounce-down {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
      </style>
    `;

    setTimeout(() => {
      document.getElementById('tutorial-skip-step')?.addEventListener('click', () => this.skip());
    }, 0);
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
    // Show success message briefly
    this.overlay.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        padding: 40px;
        border-radius: 16px;
        text-align: center;
        color: white;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        pointer-events: auto;
      ">
        <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
        <h1 style="font-size: 32px; margin: 0 0 16px 0; font-weight: 700;">Great Job!</h1>
        <p style="font-size: 18px; line-height: 1.6; opacity: 0.95;">
          You've placed your first building!<br>
          Now keep building upward. 🚀
        </p>
      </div>
    `;

    setTimeout(() => {
      TutorialOverlay.markCompleted();
      this.hide();
      if (this.onComplete) {
        this.onComplete();
      }
    }, 2500);
  }
}

/**
 * UIHints - Subtle keyboard shortcut hints
 * 
 * Shows helpful tips at the bottom of the screen:
 * - "Press F for Financial Report"
 * - "Press Space to pause"
 * - "Scroll to zoom"
 */
export class UIHints {
  private container: HTMLDivElement;
  private hints: Array<{ key: string; action: string }> = [
    { key: 'F', action: 'Financial Report' },
    { key: 'Space', action: 'Pause/Resume' },
    { key: 'Scroll', action: 'Zoom' },
    { key: '0-4', action: 'Speed Control' },
    { key: '?', action: 'Help' },
  ];

  constructor() {
    this.container = this.createContainer();
    document.body.appendChild(this.container);
    this.render();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'ui-hints';
    container.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(26, 32, 44, 0.85);
      backdrop-filter: blur(10px);
      padding: 10px 20px;
      border-radius: 8px;
      display: flex;
      gap: 20px;
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      font-size: 12px;
      color: #A0AEC0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1000;
      pointer-events: none;
    `;
    return container;
  }

  private render(): void {
    this.container.innerHTML = this.hints.map(hint => `
      <div style="display: flex; align-items: center; gap: 6px;">
        <kbd style="
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 11px;
          color: #E2E8F0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.15);
        ">${hint.key}</kbd>
        <span style="opacity: 0.85;">${hint.action}</span>
      </div>
    `).join('');
  }

  /** Hide hints (e.g., during tutorial) */
  hide(): void {
    this.container.style.display = 'none';
  }

  /** Show hints */
  show(): void {
    this.container.style.display = 'flex';
  }

  /** Remove from DOM */
  destroy(): void {
    this.container.remove();
  }
}
