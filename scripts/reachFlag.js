import { world } from "@minecraft/server";

// Default configuration values
const DEFAULT_CONFIG = {
    maxSurvivalReach: 3.8,
    sprintResetBuffer: 2.3,
    violationThreshold: 3
};
/**
 * Initialize reach detection system
 * @param {Object} config Configuration options
 * @param {number} config.maxSurvivalReach Maximum normal reach distance
 * @param {number} config.sprintResetBuffer Additional reach allowance for sprint resetting
 * @param {number} config.violationThreshold Number of violations before flagging
 */
export function reachDetection(config = {}) {
    // Merge default config with provided options
    const settings = { ...DEFAULT_CONFIG, ...config };
    
    // State tracking
    const violations = new Map();
    const lastHits = new Map();

    world.afterEvents.entityHitEntity.subscribe((eventData) => {
        const player = eventData.damagingEntity;
        const hitEntity = eventData.hitEntity;
        
        if (player.typeId !== "minecraft:player" || !hitEntity) return;

        // Calculate distance using Math.hypot
        const distance = Math.hypot(
            player.location.x - hitEntity.location.x,
            player.location.y - hitEntity.location.y,
            player.location.z - hitEntity.location.z
        );

        // Debug message showing hit entity and distance
       // world.sendMessage(`Hit Entity: ${hitEntity.typeId} (${hitEntity.name || ""}) - Distance: ${distance.toFixed(2)}`);

        const currentTime = Date.now();
        const lastHitTime = lastHits.get(player.id) || 0;
        const timeSinceLastHit = currentTime - lastHitTime;
        
        lastHits.set(player.id, currentTime);

        const maxReach = timeSinceLastHit < 450 ? 
            settings.maxSurvivalReach + settings.sprintResetBuffer : 
            settings.maxSurvivalReach;

        if (distance > maxReach) {
            const currentViolations = violations.get(player.id) || 0;
            violations.set(player.id, currentViolations + 1);

            if (currentViolations + 1 >= settings.violationThreshold) {
                world.sendMessage(`§c${player.name} might be using reach hacks! Distance: ${distance.toFixed(2)} blocks`);
                violations.set(player.id, 0);
            }
        } else {
            const currentViolations = violations.get(player.id) || 0;
            if (currentViolations > 0) {
                violations.set(player.id, currentViolations - 1);
            }
        }
    });
}