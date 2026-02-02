/**
 * GameOverModal - Game Over Screen
 * 
 * Shows when player loses (bankruptcy) or wins (TOWER status achieved).
 * Displays final stats and allows restart/continue.
 * 
 * @module ui/GameOverModal
 */

export type GameOverReason = 'bankruptcy' | 'victory';

export interface GameOverStats {
  reason: GameOverReason;
  finalFunds: number;
  finalPopulation: number;
  finalStarRating: number;
  daysPlayed: number;
  buildingsBuilt: number;
  totalIncome: number;
  totalExpenses: number;
}

export class GameOverModal {
  private modal: HTMLDivElement | null = null;
  private onRestartCallback: (() => void) | null = null;
  private onContinueCallback: (() => void) | null = null;

  constructor() {
    // Empty constructor - modal created on demand
  }

  /**
   * Show game over modal
   */
  show(stats: GameOverStats): void {
    // Remove existing modal if present
    this.hide();

    // Create modal
    this.modal = this.createModal(stats);
    document.body.appendChild(this.modal);

    // Add fade-in animation
    setTimeout(() => {
      if (this.modal) {
        this.modal.style.opacity = '1';
      }
    }, 10);
  }

  /**
   * Hide and destroy modal
   */
  hide(): void {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
      this.modal = null;
    }
  }

  /**
   * Create modal HTML
   */
  private createModal(stats: GameOverStats): HTMLDivElement {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;

    const isBankrupt = stats.reason === 'bankruptcy';
    const title = isBankrupt ? '💀 BANKRUPTCY' : '🏆 TOWER STATUS ACHIEVED!';
    const titleColor = isBankrupt ? '#ff0000' : '#ffd700';
    const subtitle = isBankrupt 
      ? 'Your tower has fallen into irreversible debt.'
      : 'Congratulations! You\'ve built the ultimate tower!';

    const content = document.createElement('div');
    content.style.cssText = `
      background: #1a1a1a;
      border: 4px solid ${titleColor};
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      color: white;
      font-family: monospace;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
    `;

    // Format money
    const formatMoney = (amount: number): string => {
      const abs = Math.abs(amount);
      if (abs >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
      if (abs >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
      return `$${amount.toLocaleString()}`;
    };

    content.innerHTML = `
      <h1 style="
        text-align: center;
        font-size: 48px;
        margin: 0 0 10px 0;
        color: ${titleColor};
        text-shadow: 0 0 20px ${titleColor};
      ">
        ${title}
      </h1>
      
      <p style="
        text-align: center;
        font-size: 18px;
        margin: 0 0 30px 0;
        opacity: 0.9;
      ">
        ${subtitle}
      </p>
      
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 30px;
      ">
        <h2 style="
          font-size: 20px;
          margin: 0 0 15px 0;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        ">
          📊 Final Statistics
        </h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
          <div><strong>Days Played:</strong></div>
          <div style="text-align: right;">${stats.daysPlayed}</div>
          
          <div><strong>Star Rating:</strong></div>
          <div style="text-align: right;">${'⭐'.repeat(stats.finalStarRating)}${isBankrupt ? '' : ' (MAX)'}</div>
          
          <div><strong>Population:</strong></div>
          <div style="text-align: right;">${stats.finalPopulation.toLocaleString()}</div>
          
          <div><strong>Buildings:</strong></div>
          <div style="text-align: right;">${stats.buildingsBuilt}</div>
          
          <div style="border-top: 1px solid #333; padding-top: 10px; margin-top: 10px;"><strong>Total Income:</strong></div>
          <div style="border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; text-align: right; color: #32cd32;">${formatMoney(stats.totalIncome)}</div>
          
          <div><strong>Total Expenses:</strong></div>
          <div style="text-align: right; color: #ff6347;">-${formatMoney(stats.totalExpenses)}</div>
          
          <div style="border-top: 1px solid #333; padding-top: 10px; margin-top: 10px;"><strong>Final Balance:</strong></div>
          <div style="
            border-top: 1px solid #333;
            padding-top: 10px;
            margin-top: 10px;
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            color: ${stats.finalFunds >= 0 ? '#32cd32' : '#ff0000'};
          ">
            ${formatMoney(stats.finalFunds)}
          </div>
        </div>
      </div>
      
      ${isBankrupt ? this.renderBankruptcyHelp() : this.renderVictoryMessage()}
      
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
        <button id="restart-btn" style="
          padding: 15px 30px;
          font-size: 16px;
          font-weight: bold;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: monospace;
          transition: all 0.2s;
        ">
          🔄 Start New Tower
        </button>
        
        ${!isBankrupt ? `
          <button id="continue-btn" style="
            padding: 15px 30px;
            font-size: 16px;
            font-weight: bold;
            background: #16a34a;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-family: monospace;
            transition: all 0.2s;
          ">
            🏗️ Continue Building
          </button>
        ` : ''}
      </div>
    `;

    modal.appendChild(content);

    // Add button handlers
    const restartBtn = content.querySelector('#restart-btn') as HTMLButtonElement;
    restartBtn.addEventListener('click', () => {
      this.hide();
      if (this.onRestartCallback) {
        this.onRestartCallback();
      }
    });

    restartBtn.addEventListener('mouseover', () => {
      restartBtn.style.background = '#b91c1c';
      restartBtn.style.transform = 'scale(1.05)';
    });

    restartBtn.addEventListener('mouseout', () => {
      restartBtn.style.background = '#dc2626';
      restartBtn.style.transform = 'scale(1)';
    });

    if (!isBankrupt) {
      const continueBtn = content.querySelector('#continue-btn') as HTMLButtonElement;
      continueBtn.addEventListener('click', () => {
        this.hide();
        if (this.onContinueCallback) {
          this.onContinueCallback();
        }
      });

      continueBtn.addEventListener('mouseover', () => {
        continueBtn.style.background = '#15803d';
        continueBtn.style.transform = 'scale(1.05)';
      });

      continueBtn.addEventListener('mouseout', () => {
        continueBtn.style.background = '#16a34a';
        continueBtn.style.transform = 'scale(1)';
      });
    }

    return modal;
  }

  /**
   * Render bankruptcy help text
   */
  private renderBankruptcyHelp(): string {
    return `
      <div style="
        background: rgba(255, 0, 0, 0.1);
        border-left: 4px solid #ff0000;
        padding: 15px;
        border-radius: 8px;
        font-size: 14px;
      ">
        <h3 style="margin: 0 0 10px 0; font-size: 16px;">💡 Tips for Next Time</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Build slowly - offices take time to generate profit</li>
          <li>Don't overbuild elevators early (expensive to maintain)</li>
          <li>Fast food buildings provide steady income during lunch rush</li>
          <li>Monitor cash flow in Tower Pulse (top-right)</li>
          <li>Wait for quarterly income before expanding</li>
        </ul>
      </div>
    `;
  }

  /**
   * Render victory message
   */
  private renderVictoryMessage(): string {
    return `
      <div style="
        background: rgba(255, 215, 0, 0.1);
        border-left: 4px solid #ffd700;
        padding: 15px;
        border-radius: 8px;
        font-size: 14px;
      ">
        <p style="margin: 0; text-align: center; font-size: 16px;">
          🎉 You've mastered the art of tower management! 🎉
        </p>
        <p style="margin: 10px 0 0 0; text-align: center; opacity: 0.8;">
          You can continue building for fun, or start a new challenge.
        </p>
      </div>
    `;
  }

  /**
   * Set restart callback
   */
  onRestart(callback: () => void): void {
    this.onRestartCallback = callback;
  }

  /**
   * Set continue callback (for victory only)
   */
  onContinue(callback: () => void): void {
    this.onContinueCallback = callback;
  }
}
