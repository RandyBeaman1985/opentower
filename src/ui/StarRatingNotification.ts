/**
 * StarRatingNotification - Shows celebratory popup when star rating increases
 * 
 * Provides visual feedback for progression milestones.
 */

export class StarRatingNotification {
  private container: HTMLDivElement | null = null;

  /**
   * Show star rating increase notification
   */
  show(oldRating: number, newRating: number): void {
    // Remove any existing notification
    this.hide();

    // Create notification
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      padding: 40px 60px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      text-align: center;
      color: white;
      font-family: monospace;
      animation: starPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    `;

    const stars = '⭐'.repeat(newRating);
    
    this.container.innerHTML = `
      <style>
        @keyframes starPop {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        @keyframes starBurst {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      </style>
      <div style="font-size: 64px; margin-bottom: 20px; animation: starBurst 0.6s ease-out;">
        ${stars}
      </div>
      <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">
        Rating Increased!
      </div>
      <div style="font-size: 18px; opacity: 0.9;">
        ${oldRating}★ → ${newRating}★
      </div>
      ${this.getUnlockMessage(newRating)}
    `;

    document.body.appendChild(this.container);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.fadeOut();
    }, 3000);
  }

  /**
   * Get unlock message for new rating
   */
  private getUnlockMessage(rating: number): string {
    const messages: Record<number, string> = {
      2: `
        <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; font-size: 14px;">
          <div style="font-weight: bold; margin-bottom: 8px;">🎉 New Buildings Unlocked!</div>
          <div style="opacity: 0.9;">Hotel Rooms • Restaurant • Condos</div>
        </div>
      `,
      3: `
        <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; font-size: 14px;">
          <div style="font-weight: bold; margin-bottom: 8px;">🎉 New Buildings Unlocked!</div>
          <div style="opacity: 0.9;">Twin Rooms • Shops</div>
          <div style="margin-top: 10px; font-style: italic; opacity: 0.8;">You're a tower tycoon! 🏗️</div>
        </div>
      `,
    };
    return messages[rating] ?? '';
  }

  /**
   * Fade out and remove notification
   */
  private fadeOut(): void {
    if (!this.container) return;

    this.container.style.transition = 'opacity 0.5s, transform 0.5s';
    this.container.style.opacity = '0';
    this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';

    setTimeout(() => {
      this.hide();
    }, 500);
  }

  /**
   * Immediately hide notification
   */
  hide(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
      this.container = null;
    }
  }
}
