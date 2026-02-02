/**
 * Pathfinding System - Multi-floor navigation with elevator usage
 * 
 * Handles finding paths between floors using stairs and elevators.
 * Returns path segments that people follow: walk → elevator → walk.
 * 
 * @module simulation/PathfindingSystem
 */

import type { Tower } from '@/interfaces';
import type { ElevatorSystem } from './ElevatorSystem';

export type PathSegmentType = 'walk' | 'elevator' | 'stairs';

export interface PathSegment {
  type: PathSegmentType;
  startFloor: number;
  endFloor: number;
  startTile: number;
  endTile: number;
  elevatorShaftId?: string; // For elevator segments
}

export class PathfindingSystem {
  /**
   * Find a path from current position to destination
   * 
   * @param fromFloor - Starting floor
   * @param fromTile - Starting tile
   * @param toFloor - Destination floor
   * @param toTile - Destination tile
   * @param tower - Tower reference
   * @param elevatorSystem - Elevator system reference
   * @returns Array of path segments to follow
   */
  findPath(
    fromFloor: number,
    fromTile: number,
    toFloor: number,
    toTile: number,
    tower: Tower,
    elevatorSystem: ElevatorSystem
  ): PathSegment[] {
    // Same floor - just walk
    if (fromFloor === toFloor) {
      return [
        {
          type: 'walk',
          startFloor: fromFloor,
          endFloor: toFloor,
          startTile: fromTile,
          endTile: toTile,
        },
      ];
    }
    
    // Different floors - need vertical transport
    const floorDifference = Math.abs(toFloor - fromFloor);
    
    // For short distances (1-2 floors), prefer stairs
    if (floorDifference <= 2) {
      const stairsPath = this.findStairsPath(
        fromFloor,
        fromTile,
        toFloor,
        toTile,
        tower
      );
      
      if (stairsPath.length > 0) {
        return stairsPath;
      }
    }
    
    // Find nearest elevator that serves both floors
    const elevator = this.findBestElevator(
      fromFloor,
      toFloor,
      fromTile,
      elevatorSystem
    );
    
    if (elevator) {
      // Path with elevator
      const segments: PathSegment[] = [];
      
      // Walk to elevator
      segments.push({
        type: 'walk',
        startFloor: fromFloor,
        endFloor: fromFloor,
        startTile: fromTile,
        endTile: elevator.tileX,
      });
      
      // Take elevator
      segments.push({
        type: 'elevator',
        startFloor: fromFloor,
        endFloor: toFloor,
        startTile: elevator.tileX,
        endTile: elevator.tileX,
        elevatorShaftId: elevator.id,
      });
      
      // Walk to final destination
      segments.push({
        type: 'walk',
        startFloor: toFloor,
        endFloor: toFloor,
        startTile: elevator.tileX,
        endTile: toTile,
      });
      
      return segments;
    }
    
    // No elevator - try stairs as fallback (even for longer distances)
    const stairsPath = this.findStairsPath(
      fromFloor,
      fromTile,
      toFloor,
      toTile,
      tower
    );
    
    if (stairsPath.length > 0) {
      return stairsPath;
    }
    
    // No path found
    return [];
  }
  
  /**
   * Find a path using stairs
   */
  private findStairsPath(
    fromFloor: number,
    fromTile: number,
    toFloor: number,
    toTile: number,
    tower: Tower
  ): PathSegment[] {
    // Find all stairs buildings
    const allBuildings = Object.values(tower.buildingsById);
    const stairsBuildings = allBuildings.filter(b => b.type === 'stairs');
    
    if (stairsBuildings.length === 0) {
      return [];
    }
    
    const floorDifference = Math.abs(toFloor - fromFloor);
    
    // Find stairs that connect the floors we need
    // For simplicity, we'll assume stairs connect adjacent floors
    // In a full implementation, you'd track which floors each stair connects
    
    // Find stairs on our starting floor
    const stairsOnStartFloor = stairsBuildings.filter(s => {
      // Stairs span multiple floors, but we check if they include our starting floor
      return s.position.floor === fromFloor || 
             (s.floors && s.floors.includes(fromFloor));
    });
    
    if (stairsOnStartFloor.length === 0) {
      return [];
    }
    
    // Find the nearest stairs to our current position
    let bestStairs = stairsOnStartFloor[0];
    if (!bestStairs) {
      return [];
    }
    
    let bestDistance = Math.abs(bestStairs.position.startTile - fromTile);
    
    for (const stairs of stairsOnStartFloor) {
      const distance = Math.abs(stairs.position.startTile - fromTile);
      if (distance < bestDistance) {
        bestStairs = stairs;
        bestDistance = distance;
      }
    }
    
    // Check if these stairs can reach our destination floor
    // For now, we assume stairs connect adjacent floors
    // In a full implementation, we'd check connectsUp/connectsDown
    if (floorDifference > 4) {
      // Stairs are uncomfortable for more than 4 floors
      return [];
    }
    
    // Create path segments using stairs
    const segments: PathSegment[] = [];
    
    // Walk to stairs
    if (fromTile !== bestStairs.position.startTile) {
      segments.push({
        type: 'walk',
        startFloor: fromFloor,
        endFloor: fromFloor,
        startTile: fromTile,
        endTile: bestStairs.position.startTile,
      });
    }
    
    // Use stairs to change floors
    segments.push({
      type: 'stairs',
      startFloor: fromFloor,
      endFloor: toFloor,
      startTile: bestStairs.position.startTile,
      endTile: bestStairs.position.startTile,
    });
    
    // Walk to final destination
    if (bestStairs.position.startTile !== toTile) {
      segments.push({
        type: 'walk',
        startFloor: toFloor,
        endFloor: toFloor,
        startTile: bestStairs.position.startTile,
        endTile: toTile,
      });
    }
    
    return segments;
  }

  /**
   * Find best elevator to use for this journey
   */
  private findBestElevator(
    fromFloor: number,
    toFloor: number,
    fromTile: number,
    elevatorSystem: ElevatorSystem
  ): { id: string; tileX: number } | null {
    const shafts = elevatorSystem.getShafts();
    
    // Filter shafts that serve both floors
    const validShafts = shafts.filter(
      shaft => shaft.servesFloor(fromFloor) && shaft.servesFloor(toFloor)
    );
    
    if (validShafts.length === 0) return null;
    
    // Pick closest elevator to current position
    let best = validShafts[0];
    if (!best) return null; // Safety check
    
    let bestDistance = Math.abs(best.tileX - fromTile);
    
    for (const shaft of validShafts) {
      const distance = Math.abs(shaft.tileX - fromTile);
      if (distance < bestDistance) {
        best = shaft;
        bestDistance = distance;
      }
    }
    
    return {
      id: best.id,
      tileX: best.tileX,
    };
  }
  
  /**
   * Check if a destination is reachable from current position
   */
  isReachable(
    fromFloor: number,
    fromTile: number,
    toFloor: number,
    toTile: number,
    _tower: Tower,
    elevatorSystem: ElevatorSystem
  ): boolean {
    const path = this.findPath(fromFloor, fromTile, toFloor, toTile, _tower, elevatorSystem);
    return path.length > 0;
  }
}
