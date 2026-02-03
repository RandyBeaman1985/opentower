/**
 * Financial Report Modal - Detailed income and expense breakdown
 * 
 * Shows players exactly where money comes from and goes to.
 * Critical for strategic tower management.
 * 
 * Design: "Corporate Print Report" aesthetic
 * - Paper texture with slight grain
 * - Professional serif headers
 * - Animated bar charts
 * - 90s business report vibes
 * 
 * Inspired by SimTower's financial reports.
 * 
 * @module ui/FinancialReportModal
 */

import type { Tower } from '@/interfaces';
import type { EconomicSystem } from '@/simulation/EconomicSystem';
import type { HotelSystem } from '@/simulation/HotelSystem';
import type { ResidentSystem } from '@/simulation/ResidentSystem';
import type { OperatingCostSystem } from '@/simulation/OperatingCostSystem';

/**
 * Design tokens for financial report
 */
const REPORT_STYLE = {
  // Paper-like colors
  paper: '#f5f5f0',
  paperDark: '#e8e8e0',
  ink: '#1a1a2e',
  inkLight: '#4a4a5a',
  
  // Semantic colors
  profit: '#228B22',
  loss: '#B22222',
  income: '#2E8B57',
  expense: '#CD5C5C',
  
  // Accents
  gold: '#B8860B',
  blue: '#4169E1',
  
  // Fonts
  fontSerif: "'Georgia', 'Times New Roman', serif",
  fontMono: "'Courier New', monospace",
};

export interface FinancialReportData {
  // Income Sources
  officeRent: number;
  condoSales: number;
  hotelIncome: number;
  foodIncome: number;
  retailIncome: number;
  entertainmentIncome: number;
  
  // Expense Sources
  elevatorCosts: number;
  buildingMaintenance: number;
  staffWages: number;
  
  // Totals
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  
  // Historical (last 4 quarters)
  quarterlyHistory: Array<{
    quarter: number;
    income: number;
    expenses: number;
    net: number;
  }>;
}

export class FinancialReportModal {
  private modal: HTMLDivElement | null = null;
  private isVisible: boolean = false;
  
  /**
   * Inject CSS animations and styles
   */
  private injectStyles(): void {
    if (document.getElementById('ot-financial-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ot-financial-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(30px) scale(0.98);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes countUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes barGrow {
        from { width: 0%; }
      }
      
      .fin-bar {
        animation: barGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      
      .fin-number {
        animation: countUp 0.5s ease forwards;
        animation-delay: 0.2s;
        opacity: 0;
      }
      
      .fin-row:nth-child(1) .fin-bar { animation-delay: 0.1s; }
      .fin-row:nth-child(2) .fin-bar { animation-delay: 0.2s; }
      .fin-row:nth-child(3) .fin-bar { animation-delay: 0.3s; }
      .fin-row:nth-child(4) .fin-bar { animation-delay: 0.4s; }
      .fin-row:nth-child(5) .fin-bar { animation-delay: 0.5s; }
      .fin-row:nth-child(6) .fin-bar { animation-delay: 0.6s; }
    `;
    document.head.appendChild(style);
  }

  /**
   * Toggle modal visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Show the financial report modal
   */
  show(): void {
    if (this.modal) {
      this.modal.style.display = 'flex';
      this.isVisible = true;
      return;
    }

    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    this.isVisible = true;
  }

  /**
   * Hide the modal
   */
  hide(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * Create the modal DOM structure with "print report" aesthetic
   */
  private createModal(): HTMLDivElement {
    // Inject animations
    this.injectStyles();
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: ${REPORT_STYLE.fontSerif};
      animation: fadeIn 0.3s ease;
    `;

    // Paper-like panel with shadow
    const panel = document.createElement('div');
    panel.style.cssText = `
      background: ${REPORT_STYLE.paper};
      background-image: 
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 35px,
          rgba(0,0,0,0.03) 35px,
          rgba(0,0,0,0.03) 36px
        );
      border: none;
      border-radius: 2px;
      width: 720px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 
        0 0 0 1px rgba(0,0,0,0.1),
        0 4px 8px rgba(0,0,0,0.2),
        0 12px 40px rgba(0,0,0,0.4),
        8px 8px 0 rgba(0,0,0,0.1);
      color: ${REPORT_STYLE.ink};
      animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
    `;
    
    // Subtle paper edge effect
    const paperEdge = document.createElement('div');
    paperEdge.style.cssText = `
      position: absolute;
      top: 0;
      right: -4px;
      width: 4px;
      height: 100%;
      background: linear-gradient(90deg, ${REPORT_STYLE.paperDark}, transparent);
    `;
    panel.appendChild(paperEdge);

    // Header - Like a printed report header
    const header = document.createElement('div');
    header.style.cssText = `
      background: ${REPORT_STYLE.ink};
      color: ${REPORT_STYLE.paper};
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px double ${REPORT_STYLE.gold};
    `;
    header.innerHTML = `
      <div>
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.7; margin-bottom: 4px;">
          CONFIDENTIAL
        </div>
        <div style="font-size: 26px; font-weight: bold; font-family: ${REPORT_STYLE.fontSerif};">
          📊 Financial Report
        </div>
        <div style="font-size: 12px; opacity: 0.7; margin-top: 4px; font-family: ${REPORT_STYLE.fontMono};">
          Tower Management Division • Daily Summary
        </div>
      </div>
      <button id="close-financial-report" style="
        background: transparent;
        color: ${REPORT_STYLE.paper};
        border: 2px solid ${REPORT_STYLE.paper};
        border-radius: 2px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        font-weight: bold;
        font-family: ${REPORT_STYLE.fontMono};
        transition: all 0.2s ease;
      " onmouseover="this.style.background='${REPORT_STYLE.paper}'; this.style.color='${REPORT_STYLE.ink}';"
         onmouseout="this.style.background='transparent'; this.style.color='${REPORT_STYLE.paper}';">
        CLOSE [ESC]
      </button>
    `;

    // Content container
    const content = document.createElement('div');
    content.id = 'financial-report-content';
    content.style.cssText = `
      padding: 24px;
    `;

    panel.appendChild(header);
    panel.appendChild(content);
    overlay.appendChild(panel);

    // Close button handler
    const closeBtn = header.querySelector('#close-financial-report');
    closeBtn?.addEventListener('click', () => this.hide());

    // Click outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide();
      }
    });

    return overlay;
  }

  /**
   * Update the modal with current financial data
   */
  update(
    tower: Tower,
    economicSystem: EconomicSystem,
    hotelSystem: HotelSystem,
    residentSystem: ResidentSystem,
    operatingCostSystem: OperatingCostSystem
  ): void {
    const data = this.calculateFinancialData(
      tower,
      economicSystem,
      hotelSystem,
      residentSystem,
      operatingCostSystem
    );

    const content = document.getElementById('financial-report-content');
    if (!content) return;

    content.innerHTML = this.renderReport(data);
  }

  /**
   * Calculate financial data from game systems
   */
  private calculateFinancialData(
    tower: Tower,
    economicSystem: EconomicSystem,
    hotelSystem: HotelSystem,
    residentSystem: ResidentSystem,
    operatingCostSystem: OperatingCostSystem
  ): FinancialReportData {
    const buildings = Object.values(tower.buildingsById);

    // Income breakdown
    let officeRent = 0;
    let condoSales = 0;
    let foodIncome = 0;
    let retailIncome = 0;
    let entertainmentIncome = 0;

    for (const building of buildings) {
      // Convert quarterly income to daily estimate
      const dailyIncome = (building.incomePerQuarter ?? 0) / 90;
      
      if (building.type === 'office' && building.state === 'active') {
        officeRent += dailyIncome;
      } else if (building.type === 'condo' && building.state === 'active') {
        condoSales += dailyIncome;
      } else if ((building.type === 'fastFood' || building.type === 'restaurant')) {
        foodIncome += dailyIncome;
      } else if (building.type === 'shop') {
        retailIncome += dailyIncome;
      } else if (building.type === 'partyHall' || building.type === 'cinema') {
        entertainmentIncome += dailyIncome;
      }
    }

    const hotelIncome = hotelSystem.getQuarterlyIncome() / 90; // Daily average

    // Expense breakdown
    const elevatorCosts = tower.elevators.length * 50; // $50 per shaft per day
    let buildingMaintenance = 0;

    for (const building of buildings) {
      // Convert quarterly maintenance to daily
      buildingMaintenance += (building.maintenanceCostPerQuarter ?? 0) / 90;
    }

    const staffWages = 0; // TODO: Implement staff wages when staff system exists

    // Totals
    const totalIncome = officeRent + condoSales + hotelIncome + foodIncome + retailIncome + entertainmentIncome;
    const totalExpenses = elevatorCosts + buildingMaintenance + staffWages;
    const netProfit = totalIncome - totalExpenses;

    // Get historical data from economic system
    const cashFlow = economicSystem.getCashFlowSummary();
    const quarterlyHistory = [
      {
        quarter: tower.clock.gameDay / 90,
        income: cashFlow.incomePerQuarter,
        expenses: totalExpenses * 90,
        net: netProfit * 90,
      },
    ];

    return {
      officeRent,
      condoSales,
      hotelIncome,
      foodIncome,
      retailIncome,
      entertainmentIncome,
      elevatorCosts,
      buildingMaintenance,
      staffWages,
      totalIncome,
      totalExpenses,
      netProfit,
      quarterlyHistory,
    };
  }

  /**
   * Render the financial report HTML with "print report" aesthetic
   */
  private renderReport(data: FinancialReportData): string {
    const formatMoney = (amount: number) => {
      const prefix = amount < 0 ? '-' : '';
      return `${prefix}$${Math.abs(Math.round(amount)).toLocaleString()}`;
    };

    const formatPercent = (part: number, total: number) => {
      if (total === 0) return '0%';
      return `${Math.round((part / total) * 100)}%`;
    };

    const renderBar = (amount: number, max: number, color: string, index: number) => {
      const percent = max > 0 ? (amount / max) * 100 : 0;
      return `
        <div class="fin-row" style="
          background: ${REPORT_STYLE.paperDark};
          height: 18px;
          border-radius: 2px;
          overflow: hidden;
          position: relative;
          margin: 6px 0;
          border: 1px solid rgba(0,0,0,0.1);
        ">
          <div class="fin-bar" style="
            background: linear-gradient(90deg, ${color}, ${color}dd);
            width: ${percent}%;
            height: 100%;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
          "></div>
        </div>
      `;
    };

    const netColor = data.netProfit >= 0 ? REPORT_STYLE.profit : REPORT_STYLE.loss;
    const netLabel = data.netProfit >= 0 ? 'PROFIT' : 'LOSS';

    return `
      <!-- Executive Summary Card -->
      <div style="
        background: ${REPORT_STYLE.ink};
        color: ${REPORT_STYLE.paper};
        padding: 28px 32px;
        margin: 24px;
        text-align: center;
        border: 2px solid ${netColor};
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: ${REPORT_STYLE.paper};
          color: ${REPORT_STYLE.ink};
          padding: 4px 16px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: bold;
        ">Executive Summary</div>
        
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.6; margin-bottom: 8px;">
          Daily Net ${netLabel}
        </div>
        <div class="fin-number" style="font-size: 48px; font-weight: bold; color: ${netColor}; font-family: ${REPORT_STYLE.fontMono};">
          ${formatMoney(data.netProfit)}
        </div>
        <div style="
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.2);
          font-family: ${REPORT_STYLE.fontMono};
          font-size: 14px;
        ">
          <div>
            <span style="color: ${REPORT_STYLE.income};">▲</span> Income: ${formatMoney(data.totalIncome)}
          </div>
          <div>
            <span style="color: ${REPORT_STYLE.expense};">▼</span> Expenses: ${formatMoney(data.totalExpenses)}
          </div>
        </div>
      </div>

      <!-- Income Breakdown -->
      <div style="margin: 0 24px 24px 24px; padding: 20px; background: rgba(46, 139, 87, 0.05); border-left: 4px solid ${REPORT_STYLE.income};">
        <h3 style="
          color: ${REPORT_STYLE.income};
          font-size: 14px;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: ${REPORT_STYLE.fontMono};
        ">▲ Revenue Sources (Daily Avg)</h3>

        <div class="fin-row" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>🏢 Office Rent</span>
            <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.officeRent)} <span style="opacity: 0.6;">(${formatPercent(data.officeRent, data.totalIncome)})</span></span>
          </div>
          ${renderBar(data.officeRent, data.totalIncome, '#4169E1', 0)}
        </div>

        <div class="fin-row" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>🏨 Hotel Revenue</span>
            <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.hotelIncome)} <span style="opacity: 0.6;">(${formatPercent(data.hotelIncome, data.totalIncome)})</span></span>
          </div>
          ${renderBar(data.hotelIncome, data.totalIncome, '#8B5CF6', 1)}
        </div>

        <div class="fin-row" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>🍔 Food Services</span>
            <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.foodIncome)} <span style="opacity: 0.6;">(${formatPercent(data.foodIncome, data.totalIncome)})</span></span>
          </div>
          ${renderBar(data.foodIncome, data.totalIncome, '#F59E0B', 2)}
        </div>

        <div class="fin-row" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>🛍️ Retail</span>
            <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.retailIncome)} <span style="opacity: 0.6;">(${formatPercent(data.retailIncome, data.totalIncome)})</span></span>
          </div>
          ${renderBar(data.retailIncome, data.totalIncome, '#14B8A6', 3)}
        </div>

        <div class="fin-row" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>🎭 Entertainment</span>
            <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.entertainmentIncome)} <span style="opacity: 0.6;">(${formatPercent(data.entertainmentIncome, data.totalIncome)})</span></span>
          </div>
          ${renderBar(data.entertainmentIncome, data.totalIncome, '#EC4899', 4)}
        </div>

        <div class="fin-row" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>🏠 Condo Sales</span>
            <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.condoSales)} <span style="opacity: 0.6;">(${formatPercent(data.condoSales, data.totalIncome)})</span></span>
          </div>
          ${renderBar(data.condoSales, data.totalIncome, '#EAB308', 5)}
        </div>

        <div style="
          margin-top: 16px;
          padding-top: 12px;
          border-top: 2px solid ${REPORT_STYLE.income};
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          font-weight: bold;
          color: ${REPORT_STYLE.income};
          font-family: ${REPORT_STYLE.fontMono};
        ">
          <span>TOTAL REVENUE</span>
          <span>${formatMoney(data.totalIncome)}/day</span>
        </div>
      </div>

      <!-- Expense Breakdown -->
      <div style="margin: 0 24px 24px 24px; padding: 20px; background: rgba(205, 92, 92, 0.05); border-left: 4px solid ${REPORT_STYLE.expense};">
        <h3 style="
          color: ${REPORT_STYLE.expense};
          font-size: 14px;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: ${REPORT_STYLE.fontMono};
        ">▼ Operating Expenses (Daily)</h3>

        <div class="fin-row" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>🛗 Elevator Operations</span>
            <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.elevatorCosts)} <span style="opacity: 0.6;">(${formatPercent(data.elevatorCosts, data.totalExpenses)})</span></span>
          </div>
          ${renderBar(data.elevatorCosts, data.totalExpenses, '#DC2626', 0)}
        </div>

        <div class="fin-row" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>🔧 Maintenance</span>
            <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.buildingMaintenance)} <span style="opacity: 0.6;">(${formatPercent(data.buildingMaintenance, data.totalExpenses)})</span></span>
          </div>
          ${renderBar(data.buildingMaintenance, data.totalExpenses, '#EA580C', 1)}
        </div>

        ${data.staffWages > 0 ? `
          <div class="fin-row" style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
              <span>👥 Staff Wages</span>
              <span style="font-weight: bold; font-family: ${REPORT_STYLE.fontMono};">${formatMoney(data.staffWages)} <span style="opacity: 0.6;">(${formatPercent(data.staffWages, data.totalExpenses)})</span></span>
            </div>
            ${renderBar(data.staffWages, data.totalExpenses, '#D97706', 2)}
          </div>
        ` : ''}

        <div style="
          margin-top: 16px;
          padding-top: 12px;
          border-top: 2px solid ${REPORT_STYLE.expense};
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          font-weight: bold;
          color: ${REPORT_STYLE.expense};
          font-family: ${REPORT_STYLE.fontMono};
        ">
          <span>TOTAL EXPENSES</span>
          <span>${formatMoney(data.totalExpenses)}/day</span>
        </div>
      </div>

      <!-- Strategy Tips - Memo style -->
      <div style="
        margin: 0 24px 24px 24px;
        padding: 20px;
        background: #FFFBEB;
        border: 1px solid #FCD34D;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -10px;
          left: 16px;
          background: #FCD34D;
          color: ${REPORT_STYLE.ink};
          padding: 2px 12px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: bold;
        ">Analyst Notes</div>
        
        <div style="font-size: 13px; color: ${REPORT_STYLE.ink}; line-height: 1.7;">
          ${data.netProfit < 0 ? `
            <div style="color: ${REPORT_STYLE.loss}; margin-bottom: 8px;">
              <strong>⚠️ ALERT:</strong> Operating at a loss. Immediate action required — expand revenue streams or reduce overhead.
            </div>
          ` : ''}
          ${data.elevatorCosts > data.totalExpenses * 0.4 ? `
            <div style="color: ${REPORT_STYLE.expense}; margin-bottom: 8px;">
              <strong>🛗 Cost Alert:</strong> Elevator costs represent ${formatPercent(data.elevatorCosts, data.totalExpenses)} of expenses. Consider shaft consolidation.
            </div>
          ` : ''}
          ${data.officeRent < data.totalIncome * 0.3 && data.totalIncome > 0 ? `
            <div style="margin-bottom: 8px;">
              <strong>💼 Recommendation:</strong> Office space provides stable quarterly income. Consider expansion.
            </div>
          ` : ''}
          ${data.hotelIncome > data.totalIncome * 0.4 ? `
            <div style="color: #7C3AED; margin-bottom: 8px;">
              <strong>🏨 Key Revenue:</strong> Hotels are primary income source (${formatPercent(data.hotelIncome, data.totalIncome)}). Maintain high guest satisfaction.
            </div>
          ` : ''}
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #FCD34D; font-style: italic; opacity: 0.8;">
            Target: Daily profit > $5,000 for sustainable growth. Press <kbd style="background: ${REPORT_STYLE.ink}; color: white; padding: 2px 6px; border-radius: 2px; font-size: 11px;">F</kbd> anytime to review finances.
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Clean up and remove modal
   */
  destroy(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    this.isVisible = false;
  }
}
