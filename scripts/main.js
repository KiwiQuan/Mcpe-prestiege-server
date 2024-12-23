import { world, system } from "@minecraft/server";

// Constants for reach detection
const MAX_SURVIVAL_REACH = 4;
const SPRINT_RESET_BUFFER = 2.4; // Additional reach allowance for sprint resetting
const VIOLATION_THRESHOLD = 3; // Number of violations before flagging


// Track violations and last hit timestamps for each player
const violations = new Map();
const lastHits = new Map();

// Listen for entity hit events
world.afterEvents.entityHitEntity.subscribe((eventData) => {
    const player = eventData.damagingEntity;
    const hitEntity = eventData.hitEntity;
    
    // Only process if the attacker is a player and there's a hit entity
    if (player.typeId === "minecraft:player" && hitEntity) {
        const playerPos = player.location;
        const targetPos = hitEntity.location;
        
        const distance = Math.hypot(
            playerPos.x - targetPos.x,
            playerPos.y - targetPos.y,
            playerPos.z - targetPos.z
        );

        // Get current time for hit tracking
        const currentTime = Date.now();
        const lastHitTime = lastHits.get(player.id) || 0;
        const timeSinceLastHit = currentTime - lastHitTime;
        
        // Update last hit time
        lastHits.set(player.id, currentTime);

        // Determine maximum allowed reach
        // If hits are close together (sprint resetting), allow for slightly more reach
        const maxReach = timeSinceLastHit < 500 ? 
            MAX_SURVIVAL_REACH + SPRINT_RESET_BUFFER : 
            MAX_SURVIVAL_REACH;

        // Check if the reach exceeds maximum allowed distance
        if (distance > maxReach) {
            // Increment violations
            const currentViolations = violations.get(player.id) || 0;
            violations.set(player.id, currentViolations + 1);

            // Only flag if violations exceed threshold
            if (currentViolations + 1 >= VIOLATION_THRESHOLD) {
                world.sendMessage(`§c${player.name} might be using reach hacks! Distance: ${distance.toFixed(2)} blocks`);
                violations.set(player.id, 0); // Reset violations
            }
        } else {
            // Gradually decrease violations for legitimate hits
            const currentViolations = violations.get(player.id) || 0;
            if (currentViolations > 0) {
                violations.set(player.id, currentViolations - 1);
            }
        }
    }
});

