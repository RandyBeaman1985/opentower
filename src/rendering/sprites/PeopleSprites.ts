/**
 * PeopleSprites - Sprite asset management for people/characters
 * 
 * Replaces 4px colored circles with animated pixel art sprites:
 * - Walking animations (2-frame cycle)
 * - Stress-colored variants (Black/Pink/Red based on stress level)
 * - Directional sprites (left-facing, right-facing)
 * 
 * @module rendering/sprites/PeopleSprites
 */

import { Texture, Sprite as PIXISprite, AnimatedSprite } from 'pixi.js';
import type { Person } from '@/entities/Person';

/**
 * Stress levels mapped to sprite colors
 */
export enum StressColor {
  NORMAL = 'black', // 0-20 stress
  LIGHT_PINK = 'light-pink', // 21-40 stress
  DARK_PINK = 'dark-pink', // 41-60 stress
  RED = 'red', // 61-80 stress
  DARK_RED = 'dark-red', // 81-100 stress
}

/**
 * Animation states for people
 */
export enum AnimationState {
  IDLE = 'idle',
  WALKING = 'walking',
  WAITING = 'waiting',
}

/**
 * Get stress color based on stress level
 */
export function getStressColor(stress: number): StressColor {
  if (stress <= 20) return StressColor.NORMAL;
  if (stress <= 40) return StressColor.LIGHT_PINK;
  if (stress <= 60) return StressColor.DARK_PINK;
  if (stress <= 80) return StressColor.RED;
  return StressColor.DARK_RED;
}

/**
 * Sprite cache for person sprites
 */
const personSpriteCache = new Map<string, Texture[]>();

/**
 * Load person sprite frames for a specific color and direction
 * 
 * @param color - Stress color variant
 * @param direction - 'left' or 'right'
 * @param animation - Animation state (idle/walking/waiting)
 * @returns Array of textures for animation frames
 */
export async function loadPersonSprite(
  color: StressColor,
  direction: 'left' | 'right',
  animation: AnimationState = AnimationState.IDLE
): Promise<Texture[]> {
  const cacheKey = `${color}-${direction}-${animation}`;
  
  // Return cached textures if available
  if (personSpriteCache.has(cacheKey)) {
    return personSpriteCache.get(cacheKey)!;
  }
  
  // Build asset paths
  const basePath = `/assets/people/person-${color}-${direction}`;
  const textures: Texture[] = [];
  
  try {
    if (animation === AnimationState.WALKING) {
      // Walking has 2 frames for leg animation
      const frame1 = await Texture.from(`${basePath}-walk-1.png`);
      const frame2 = await Texture.from(`${basePath}-walk-2.png`);
      textures.push(frame1, frame2);
    } else {
      // Idle/waiting is static (1 frame)
      const frame = await Texture.from(`${basePath}-idle.png`);
      textures.push(frame);
    }
    
    personSpriteCache.set(cacheKey, textures);
    return textures;
  } catch (error) {
    console.error(`❌ Failed to load person sprite: ${basePath}`, error);
    
    // Return fallback placeholder texture
    // For now, return empty array (will fall back to circle rendering)
    return [];
  }
}

/**
 * Create an animated sprite for a person
 * 
 * @param person - Person entity
 * @param direction - 'left' or 'right' facing
 * @returns AnimatedSprite or null if textures not loaded
 */
export async function createPersonSprite(
  person: Person,
  direction: 'left' | 'right'
): Promise<AnimatedSprite | null> {
  const color = getStressColor(person.stress);
  const animation = person.state === 'walking' ? AnimationState.WALKING : AnimationState.IDLE;
  
  const textures = await loadPersonSprite(color, direction, animation);
  if (textures.length === 0) {
    return null;
  }
  
  const sprite = new AnimatedSprite(textures);
  
  // Animation settings for walking
  if (animation === AnimationState.WALKING) {
    sprite.animationSpeed = 0.1; // 10 frames per second (200ms per frame)
    sprite.play();
  } else {
    sprite.gotoAndStop(0); // Static frame for idle
  }
  
  // Sprite setup
  sprite.anchor.set(0.5, 1); // Bottom-center anchor for easy floor positioning
  sprite.scale.set(1); // 8×16px at 1:1 scale
  
  return sprite;
}

/**
 * Update person sprite based on current state
 * 
 * Call this when person's stress or state changes
 * 
 * @param sprite - Existing AnimatedSprite
 * @param person - Person entity
 * @param direction - Current facing direction
 */
export async function updatePersonSprite(
  sprite: AnimatedSprite,
  person: Person,
  direction: 'left' | 'right'
): Promise<void> {
  const color = getStressColor(person.stress);
  const animation = person.state === 'walking' ? AnimationState.WALKING : AnimationState.IDLE;
  
  const textures = await loadPersonSprite(color, direction, animation);
  if (textures.length === 0) {
    return;
  }
  
  // Update textures
  sprite.textures = textures;
  
  // Update animation state
  if (animation === AnimationState.WALKING) {
    sprite.animationSpeed = 0.1;
    sprite.play();
  } else {
    sprite.gotoAndStop(0);
  }
}

/**
 * Preload all person sprite variants
 * Call during game initialization
 */
export async function preloadPersonSprites(): Promise<void> {
  console.log('👥 Preloading person sprites...');
  
  const colors = Object.values(StressColor);
  const directions: ('left' | 'right')[] = ['left', 'right'];
  const animations = [AnimationState.IDLE, AnimationState.WALKING];
  
  const promises: Promise<Texture[]>[] = [];
  
  for (const color of colors) {
    for (const direction of directions) {
      for (const animation of animations) {
        promises.push(loadPersonSprite(color, direction, animation));
      }
    }
  }
  
  await Promise.all(promises);
  
  const totalVariants = colors.length * directions.length * animations.length;
  console.log(`✅ Preloaded ${totalVariants} person sprite variants`);
}

/**
 * Clear person sprite cache
 */
export function clearPersonSpriteCache(): void {
  personSpriteCache.clear();
  console.log('🗑️ Person sprite cache cleared');
}

/**
 * Helper: Determine person facing direction based on movement
 * 
 * @param person - Person entity
 * @param previousTile - Previous tile position (for direction calculation)
 * @returns 'left' or 'right'
 */
export function getPersonDirection(person: Person, previousTile?: number): 'left' | 'right' {
  if (previousTile === undefined) {
    return 'right'; // Default facing
  }
  
  // If moving left, face left; if moving right, face right
  return person.currentTile < previousTile ? 'left' : 'right';
}

/**
 * Get sprite dimensions for people (consistent across all variants)
 */
export function getPersonSpriteDimensions(): { width: number; height: number } {
  return {
    width: 8, // 8px wide
    height: 16, // 16px tall (1 tile height)
  };
}
