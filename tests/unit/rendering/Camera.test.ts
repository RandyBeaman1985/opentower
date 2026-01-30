/**
 * Camera unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Camera } from '@rendering/Camera';
import { resetEventBus } from '@core/EventBus';

describe('Camera', () => {
  let camera: Camera;

  beforeEach(() => {
    resetEventBus();
    // Use larger world bounds to avoid clamping in most tests
    camera = new Camera({
      worldBounds: {
        minX: -10000,
        maxX: 10000,
        minY: -10000,
        maxY: 10000,
      },
    });
    camera.setViewport(800, 600);
  });

  describe('Initial state', () => {
    it('should start at origin with zoom 1', () => {
      const state = camera.getState();

      expect(state.x).toBe(0);
      expect(state.y).toBe(0);
      expect(state.zoom).toBe(1);
      expect(state.isDragging).toBe(false);
    });
  });

  describe('Position', () => {
    it('should set position directly', () => {
      camera.setPosition(100, 200);

      const pos = camera.getPosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(200);
    });

    it('should pan by delta', () => {
      camera.setPosition(100, 100);
      camera.pan(50, -30);

      const pos = camera.getPosition();
      expect(pos.x).toBe(150);
      expect(pos.y).toBe(70);
    });

    it('should clamp position to world bounds', () => {
      // Create camera with smaller bounds to test clamping
      const constrainedCamera = new Camera({
        worldBounds: {
          minX: 0,
          maxX: 1000,
          minY: 0,
          maxY: 1000,
        },
      });
      constrainedCamera.setViewport(800, 600);

      // Try to move past left bound
      constrainedCamera.setPosition(-1000, 0);

      // Should be clamped to visible area (minX + halfWidth = 0 + 400 = 400)
      const pos = constrainedCamera.getPosition();
      expect(pos.x).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Zoom', () => {
    it('should set zoom directly', () => {
      camera.setZoom(1.5);
      expect(camera.getZoom()).toBe(1.5);
    });

    it('should clamp zoom to min', () => {
      camera.setZoom(0.1); // Below minZoom of 0.25
      expect(camera.getZoom()).toBe(0.25);
    });

    it('should clamp zoom to max', () => {
      camera.setZoom(5); // Above maxZoom of 2.0
      expect(camera.getZoom()).toBe(2.0);
    });

    it('should zoom by delta', () => {
      camera.setZoom(1);
      camera.zoomBy(1); // Zoom in

      expect(camera.getZoom()).toBeGreaterThan(1);
    });
  });

  describe('Dragging', () => {
    it('should track drag state', () => {
      expect(camera.isDragging()).toBe(false);

      camera.startDrag(400, 300);
      expect(camera.isDragging()).toBe(true);

      camera.endDrag();
      expect(camera.isDragging()).toBe(false);
    });

    it('should update position during drag', () => {
      camera.setPosition(100, 100);
      camera.startDrag(400, 300);
      camera.updateDrag(350, 280); // Dragged 50px right, 20px down

      const pos = camera.getPosition();
      // Camera should move opposite to drag direction
      expect(pos.x).toBe(150); // 100 + 50
      expect(pos.y).toBe(120); // 100 + 20
    });
  });

  describe('Coordinate conversion', () => {
    it('should convert screen to world coordinates', () => {
      camera.setPosition(100, 100);
      camera.setZoom(1);

      // Screen center should map to camera position
      const world = camera.screenToWorld(400, 300);
      expect(world.x).toBe(100);
      expect(world.y).toBe(100);
    });

    it('should convert world to screen coordinates', () => {
      camera.setPosition(100, 100);
      camera.setZoom(1);

      // Camera position should be at screen center
      const screen = camera.worldToScreen(100, 100);
      expect(screen.x).toBe(400);
      expect(screen.y).toBe(300);
    });

    it('should account for zoom in conversion', () => {
      camera.setPosition(0, 0);
      camera.setZoom(2);

      // At zoom 2, world coordinates are doubled
      const screen = camera.worldToScreen(50, 50);
      expect(screen.x).toBe(400 + 100); // center + 50*2
      expect(screen.y).toBe(300 + 100);
    });
  });

  describe('Visible bounds', () => {
    it('should calculate visible bounds correctly', () => {
      camera.setPosition(1000, 500);
      camera.setZoom(1);

      const bounds = camera.getVisibleBounds();

      // With 800x600 viewport at zoom 1
      expect(bounds.minX).toBe(600); // 1000 - 400
      expect(bounds.maxX).toBe(1400); // 1000 + 400
      expect(bounds.minY).toBe(200); // 500 - 300
      expect(bounds.maxY).toBe(800); // 500 + 300
    });

    it('should adjust bounds for zoom', () => {
      camera.setPosition(1000, 500);
      camera.setZoom(2);

      const bounds = camera.getVisibleBounds();

      // At zoom 2, visible area is halved
      expect(bounds.maxX - bounds.minX).toBe(400); // 800/2
      expect(bounds.maxY - bounds.minY).toBe(300); // 600/2
    });
  });

  describe('Visibility check', () => {
    it('should detect visible objects', () => {
      camera.setPosition(500, 500);
      camera.setZoom(1);

      // Object at camera center
      expect(camera.isVisible(450, 450, 100, 100)).toBe(true);

      // Object far from camera
      expect(camera.isVisible(10000, 10000, 100, 100)).toBe(false);
    });

    it('should handle partial visibility', () => {
      camera.setPosition(500, 500);
      camera.setZoom(1);

      // Object partially visible at edge
      expect(camera.isVisible(850, 500, 100, 100)).toBe(true);
    });
  });

  describe('Transform for rendering', () => {
    it('should provide correct transform values', () => {
      camera.setPosition(100, 200);
      camera.setZoom(1.5);

      const transform = camera.getTransform();

      expect(transform.scale).toBe(1.5);
      // x = viewport_width/2 - camera_x * zoom
      expect(transform.x).toBe(400 - 100 * 1.5);
      expect(transform.y).toBe(300 - 200 * 1.5);
    });
  });

  describe('Center on floor', () => {
    it('should center on a specific floor', () => {
      camera.centerOnFloor(5, 16, 48);

      const pos = camera.getPosition();
      // Center X should be half of tower width
      expect(pos.x).toBe((375 * 16) / 2);
      // Center Y should be floor level + half floor height
      expect(pos.y).toBe(5 * 48 + 24);
    });
  });

  describe('Serialization', () => {
    it('should serialize state', () => {
      camera.setPosition(100, 200);
      camera.setZoom(1.5);

      const state = camera.serialize();

      expect(state.x).toBe(100);
      expect(state.y).toBe(200);
      expect(state.zoom).toBe(1.5);
    });

    it('should deserialize state', () => {
      const state = {
        x: 150,
        y: 250,
        zoom: 1.75,
        targetZoom: 1.75,
        isDragging: false,
      };

      camera.deserialize(state);

      expect(camera.getPosition().x).toBe(150);
      expect(camera.getPosition().y).toBe(250);
      expect(camera.getZoom()).toBe(1.75);
    });
  });
});
