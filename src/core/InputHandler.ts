/**
 * InputHandler - Manages keyboard and mouse input for camera controls
 * 
 * Handles:
 * - WASD / Arrow keys for panning
 * - Mouse wheel for zooming
 * - Middle mouse button drag for panning
 * - Edge-of-screen panning (optional)
 */

import { Camera } from '../rendering/Camera';

export interface InputConfig {
  /** Pan speed in pixels per second */
  panSpeed: number;
  /** Zoom sensitivity (mouse wheel) */
  zoomSensitivity: number;
  /** Enable edge-of-screen panning */
  enableEdgePan: boolean;
  /** Edge pan activation zone (pixels from edge) */
  edgePanZone: number;
  /** Edge pan speed multiplier */
  edgePanSpeed: number;
}

const DEFAULT_CONFIG: InputConfig = {
  panSpeed: 400, // pixels per second
  zoomSensitivity: 0.002,
  enableEdgePan: true,
  edgePanZone: 40, // pixels from edge
  edgePanSpeed: 300, // pixels per second
};

/**
 * InputHandler - Wires up camera controls
 */
export class InputHandler {
  private camera: Camera;
  private canvas: HTMLCanvasElement;
  private config: InputConfig;
  
  // Keyboard state
  private keysPressed = new Set<string>();
  
  // Mouse state
  private mouseX = 0;
  private mouseY = 0;
  private isMiddleDragging = false;
  private canvasWidth = 0;
  private canvasHeight = 0;
  
  // Event handlers (stored for cleanup)
  private boundHandlers = {
    keydown: this.onKeyDown.bind(this),
    keyup: this.onKeyUp.bind(this),
    wheel: this.onWheel.bind(this),
    mousedown: this.onMouseDown.bind(this),
    mousemove: this.onMouseMove.bind(this),
    mouseup: this.onMouseUp.bind(this),
    contextmenu: this.onContextMenu.bind(this),
  };
  
  constructor(camera: Camera, canvas: HTMLCanvasElement, config?: Partial<InputConfig>) {
    this.camera = camera;
    this.canvas = canvas;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    
    this.attachListeners();
  }
  
  /**
   * Attach event listeners
   */
  private attachListeners(): void {
    // Keyboard
    window.addEventListener('keydown', this.boundHandlers.keydown);
    window.addEventListener('keyup', this.boundHandlers.keyup);
    
    // Mouse wheel
    this.canvas.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
    
    // Mouse buttons
    this.canvas.addEventListener('mousedown', this.boundHandlers.mousedown);
    this.canvas.addEventListener('mousemove', this.boundHandlers.mousemove);
    window.addEventListener('mouseup', this.boundHandlers.mouseup);
    
    // Prevent context menu on right-click (we use it for camera)
    this.canvas.addEventListener('contextmenu', this.boundHandlers.contextmenu);
  }
  
  /**
   * Detach event listeners (cleanup)
   */
  detach(): void {
    window.removeEventListener('keydown', this.boundHandlers.keydown);
    window.removeEventListener('keyup', this.boundHandlers.keyup);
    this.canvas.removeEventListener('wheel', this.boundHandlers.wheel);
    this.canvas.removeEventListener('mousedown', this.boundHandlers.mousedown);
    this.canvas.removeEventListener('mousemove', this.boundHandlers.mousemove);
    window.removeEventListener('mouseup', this.boundHandlers.mouseup);
    this.canvas.removeEventListener('contextmenu', this.boundHandlers.contextmenu);
  }
  
  /**
   * Update input state (call each frame)
   */
  update(deltaTime: number): void {
    // WASD / Arrow key panning
    let panX = 0;
    let panY = 0;
    
    if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) {
      panY -= 1;
    }
    if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) {
      panY += 1;
    }
    if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) {
      panX -= 1;
    }
    if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) {
      panX += 1;
    }
    
    // Apply keyboard panning
    if (panX !== 0 || panY !== 0) {
      const speed = this.config.panSpeed * deltaTime;
      this.camera.pan(panX * speed, panY * speed);
    }
    
    // Edge-of-screen panning
    if (this.config.enableEdgePan) {
      this.updateEdgePan(deltaTime);
    }
  }
  
  /**
   * Update edge-of-screen panning
   */
  private updateEdgePan(deltaTime: number): void {
    let edgePanX = 0;
    let edgePanY = 0;
    
    const zone = this.config.edgePanZone;
    
    // Left edge
    if (this.mouseX < zone) {
      edgePanX = -1;
    }
    // Right edge
    if (this.mouseX > this.canvasWidth - zone) {
      edgePanX = 1;
    }
    // Top edge
    if (this.mouseY < zone) {
      edgePanY = -1;
    }
    // Bottom edge
    if (this.mouseY > this.canvasHeight - zone) {
      edgePanY = 1;
    }
    
    // Apply edge panning
    if (edgePanX !== 0 || edgePanY !== 0) {
      const speed = this.config.edgePanSpeed * deltaTime;
      this.camera.pan(edgePanX * speed, edgePanY * speed);
    }
  }
  
  /**
   * Handle key down
   */
  private onKeyDown(e: KeyboardEvent): void {
    // Don't capture keys if typing in an input field
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    // Don't capture modifier combos (like Ctrl+D for debug)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    
    this.keysPressed.add(e.code);
  }
  
  /**
   * Handle key up
   */
  private onKeyUp(e: KeyboardEvent): void {
    this.keysPressed.delete(e.code);
  }
  
  /**
   * Handle mouse wheel (zoom)
   */
  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    
    // Get mouse position for zoom center
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Zoom in/out based on wheel direction
    const delta = -e.deltaY * this.config.zoomSensitivity;
    this.camera.zoomBy(delta, mouseX, mouseY);
  }
  
  /**
   * Handle mouse down
   */
  private onMouseDown(e: MouseEvent): void {
    // Middle mouse button (or Ctrl+Left on Mac)
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault();
      this.isMiddleDragging = true;
      this.camera.startDrag(e.offsetX, e.offsetY);
    }
  }
  
  /**
   * Handle mouse move
   */
  private onMouseMove(e: MouseEvent): void {
    this.mouseX = e.offsetX;
    this.mouseY = e.offsetY;
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    
    // Update middle-mouse drag
    if (this.isMiddleDragging) {
      this.camera.updateDrag(e.offsetX, e.offsetY);
    }
  }
  
  /**
   * Handle mouse up
   */
  private onMouseUp(e: MouseEvent): void {
    if (e.button === 1 || (e.button === 0 && this.isMiddleDragging)) {
      this.isMiddleDragging = false;
      this.camera.endDrag();
    }
  }
  
  /**
   * Prevent context menu on canvas
   */
  private onContextMenu(e: Event): void {
    e.preventDefault();
  }
  
  /**
   * Check if currently middle-dragging (used by building placer to avoid conflicts)
   */
  isMiddleMouseDragging(): boolean {
    return this.isMiddleDragging;
  }
  
  /**
   * Update config
   */
  setConfig(config: Partial<InputConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Get current config
   */
  getConfig(): InputConfig {
    return { ...this.config };
  }
}
