/**
 * Camera - Handles viewport pan and zoom
 *
 * Manages the view transformation for the game world.
 * Supports smooth panning and zooming with constraints.
 *
 * @module rendering/Camera
 */

import { getEventBus } from '@core/EventBus';

/**
 * Camera configuration
 */
export interface CameraConfig {
  /** Minimum zoom level (zoomed out) */
  minZoom: number;
  /** Maximum zoom level (zoomed in) */
  maxZoom: number;
  /** Zoom speed multiplier */
  zoomSpeed: number;
  /** Enable smooth zoom transitions */
  smoothZoom: boolean;
  /** World bounds (in world coordinates) */
  worldBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * Camera state
 */
export interface CameraState {
  /** Camera X position (world coordinates) */
  x: number;
  /** Camera Y position (world coordinates) */
  y: number;
  /** Current zoom level */
  zoom: number;
  /** Target zoom for smooth transitions */
  targetZoom: number;
  /** Is camera currently being dragged */
  isDragging: boolean;
}

/**
 * Default camera configuration
 */
const DEFAULT_CONFIG: CameraConfig = {
  minZoom: 0.25,
  maxZoom: 2.0,
  zoomSpeed: 0.1,
  smoothZoom: true,
  worldBounds: {
    minX: 0,
    maxX: 375 * 16, // 375 tiles * 16 pixels (HD)
    minY: -10 * 48, // 10 basement floors * 48 pixels
    maxY: 100 * 48, // 100 floors * 48 pixels
  },
};

/**
 * Camera class - manages viewport transformation
 */
export class Camera {
  private state: CameraState;
  private config: CameraConfig;

  // Viewport dimensions (screen space)
  private viewportWidth: number = 800;
  private viewportHeight: number = 600;

  // Drag state
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragStartCamX: number = 0;
  private dragStartCamY: number = 0;

  // Screen settle effect (micro-movement on building placement)
  private settleOffset: { x: number; y: number } = { x: 0, y: 0 };
  private settleVelocity: { x: number; y: number } = { x: 0, y: 0 };
  private settleDamping: number = 0.85;

  constructor(config?: Partial<CameraConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.state = {
      x: 0,
      y: 0,
      zoom: 1,
      targetZoom: 1,
      isDragging: false,
    };
  }

  /**
   * Set viewport dimensions
   */
  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Get current camera state
   */
  getState(): Readonly<CameraState> {
    return { ...this.state };
  }

  /**
   * Get camera position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.state.x, y: this.state.y };
  }

  /**
   * Get current zoom level
   */
  getZoom(): number {
    return this.state.zoom;
  }

  /**
   * Set camera position directly
   */
  setPosition(x: number, y: number): void {
    this.state.x = this.clampX(x);
    this.state.y = this.clampY(y);

    this.emitCameraChange();
  }

  /**
   * Move camera by delta
   */
  pan(deltaX: number, deltaY: number): void {
    this.setPosition(this.state.x + deltaX / this.state.zoom, this.state.y + deltaY / this.state.zoom);
  }

  /**
   * Set zoom level directly
   */
  setZoom(zoom: number, centerX?: number, centerY?: number): void {
    const newZoom = this.clampZoom(zoom);

    // If center point provided, zoom toward that point
    if (centerX !== undefined && centerY !== undefined) {
      // Convert screen center to world coordinates before zoom
      const worldX = this.screenToWorldX(centerX);
      const worldY = this.screenToWorldY(centerY);

      // Apply zoom
      this.state.zoom = newZoom;
      this.state.targetZoom = newZoom;

      // Adjust position to keep the world point under the screen point
      const newWorldX = this.screenToWorldX(centerX);
      const newWorldY = this.screenToWorldY(centerY);

      this.state.x += worldX - newWorldX;
      this.state.y += worldY - newWorldY;

      // Clamp position
      this.state.x = this.clampX(this.state.x);
      this.state.y = this.clampY(this.state.y);
    } else {
      this.state.zoom = newZoom;
      this.state.targetZoom = newZoom;
    }

    this.emitCameraChange();
  }

  /**
   * Zoom by delta (positive = zoom in, negative = zoom out)
   */
  zoomBy(delta: number, centerX?: number, centerY?: number): void {
    const newZoom = this.state.zoom * (1 + delta * this.config.zoomSpeed);
    this.setZoom(newZoom, centerX, centerY);
  }

  /**
   * Start dragging (call on mouse down)
   */
  startDrag(screenX: number, screenY: number): void {
    this.state.isDragging = true;
    this.dragStartX = screenX;
    this.dragStartY = screenY;
    this.dragStartCamX = this.state.x;
    this.dragStartCamY = this.state.y;
  }

  /**
   * Update drag (call on mouse move)
   */
  updateDrag(screenX: number, screenY: number): void {
    if (!this.state.isDragging) return;

    const deltaX = this.dragStartX - screenX;
    const deltaY = this.dragStartY - screenY;

    this.state.x = this.clampX(this.dragStartCamX + deltaX / this.state.zoom);
    this.state.y = this.clampY(this.dragStartCamY + deltaY / this.state.zoom);

    this.emitCameraChange();
  }

  /**
   * End dragging (call on mouse up)
   */
  endDrag(): void {
    this.state.isDragging = false;
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.state.isDragging;
  }

  /**
   * Update camera (call each frame for smooth zoom)
   */
  update(deltaTime: number): void {
    if (!this.config.smoothZoom) return;

    // Smooth zoom interpolation
    if (Math.abs(this.state.zoom - this.state.targetZoom) > 0.001) {
      const t = Math.min(1, deltaTime * 10); // Adjust speed as needed
      this.state.zoom = this.state.zoom + (this.state.targetZoom - this.state.zoom) * t;

      this.emitCameraChange();
    }

    // Update screen settle effect (spring damping)
    if (Math.abs(this.settleOffset.x) > 0.01 || Math.abs(this.settleOffset.y) > 0.01 ||
        Math.abs(this.settleVelocity.x) > 0.01 || Math.abs(this.settleVelocity.y) > 0.01) {
      
      // Spring force toward center
      const springForce = 0.3;
      this.settleVelocity.x += -this.settleOffset.x * springForce;
      this.settleVelocity.y += -this.settleOffset.y * springForce;

      // Apply damping
      this.settleVelocity.x *= this.settleDamping;
      this.settleVelocity.y *= this.settleDamping;

      // Update position
      this.settleOffset.x += this.settleVelocity.x;
      this.settleOffset.y += this.settleVelocity.y;

      // Stop when velocity is very small
      if (Math.abs(this.settleVelocity.x) < 0.01 && Math.abs(this.settleVelocity.y) < 0.01) {
        this.settleOffset.x = 0;
        this.settleOffset.y = 0;
        this.settleVelocity.x = 0;
        this.settleVelocity.y = 0;
      }
    }
  }

  /**
   * Apply screen settle effect (subtle micro-movement)
   * Used for building placement feedback
   */
  applySettle(intensity: number = 1.0): void {
    // Small downward impulse (like something landing)
    this.settleVelocity.y += 0.8 * intensity;
    this.settleVelocity.x += (Math.random() - 0.5) * 0.3 * intensity;
  }

  /**
   * Convert screen X coordinate to world X coordinate
   */
  screenToWorldX(screenX: number): number {
    return this.state.x + (screenX - this.viewportWidth / 2) / this.state.zoom;
  }

  /**
   * Convert screen Y coordinate to world Y coordinate
   */
  screenToWorldY(screenY: number): number {
    return this.state.y + (screenY - this.viewportHeight / 2) / this.state.zoom;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: this.screenToWorldX(screenX),
      y: this.screenToWorldY(screenY),
    };
  }

  /**
   * Convert world X coordinate to screen X coordinate
   */
  worldToScreenX(worldX: number): number {
    return (worldX - this.state.x) * this.state.zoom + this.viewportWidth / 2;
  }

  /**
   * Convert world Y coordinate to screen Y coordinate
   */
  worldToScreenY(worldY: number): number {
    return (worldY - this.state.y) * this.state.zoom + this.viewportHeight / 2;
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: this.worldToScreenX(worldX),
      y: this.worldToScreenY(worldY),
    };
  }

  /**
   * Get visible world bounds (for frustum culling)
   */
  getVisibleBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    const halfWidth = this.viewportWidth / 2 / this.state.zoom;
    const halfHeight = this.viewportHeight / 2 / this.state.zoom;

    return {
      minX: this.state.x - halfWidth,
      maxX: this.state.x + halfWidth,
      minY: this.state.y - halfHeight,
      maxY: this.state.y + halfHeight,
    };
  }

  /**
   * Check if a world rectangle is visible
   */
  isVisible(x: number, y: number, width: number, height: number): boolean {
    const bounds = this.getVisibleBounds();
    return x + width >= bounds.minX && x <= bounds.maxX && y + height >= bounds.minY && y <= bounds.maxY;
  }

  /**
   * Center camera on a world position
   */
  centerOn(worldX: number, worldY: number): void {
    this.setPosition(worldX, worldY);
  }

  /**
   * Center camera on a specific floor
   */
  centerOnFloor(level: number, tileWidth: number = 16, floorHeight: number = 48): void {
    const centerX = (375 * tileWidth) / 2; // Center of tower width
    const centerY = level * floorHeight + floorHeight / 2;
    this.centerOn(centerX, centerY);
  }

  /**
   * Get transformation values for PixiJS container
   * Includes screen settle offset for juice
   */
  getTransform(): { x: number; y: number; scale: number } {
    return {
      x: this.viewportWidth / 2 - this.state.x * this.state.zoom + this.settleOffset.x,
      y: this.viewportHeight / 2 - this.state.y * this.state.zoom + this.settleOffset.y,
      scale: this.state.zoom,
    };
  }

  // Private helper methods

  private clampZoom(zoom: number): number {
    return Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoom));
  }

  private clampX(x: number): number {
    const halfWidth = this.viewportWidth / 2 / this.state.zoom;
    return Math.max(
      this.config.worldBounds.minX + halfWidth,
      Math.min(this.config.worldBounds.maxX - halfWidth, x)
    );
  }

  private clampY(y: number): number {
    const halfHeight = this.viewportHeight / 2 / this.state.zoom;
    return Math.max(
      this.config.worldBounds.minY + halfHeight,
      Math.min(this.config.worldBounds.maxY - halfHeight, y)
    );
  }

  private emitCameraChange(): void {
    getEventBus().emitSync({
      type: 'CAMERA_CHANGE',
      x: this.state.x,
      y: this.state.y,
      zoom: this.state.zoom,
    });
  }

  /**
   * Serialize camera state for saving
   */
  serialize(): CameraState {
    return { ...this.state };
  }

  /**
   * Load camera state from save
   */
  deserialize(state: CameraState): void {
    this.state = { ...state };
    this.emitCameraChange();
  }
}
