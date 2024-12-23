import { world, system } from "@minecraft/server";

// Constants for reach detection
const MAX_SURVIVAL_REACH = 5.5;
const CHECK_INTERVAL = 10;

// Track the last hit entity for each player
const lastHits = new Map();

// Listen for entity hit events
world.afterEvents.entityHitEntity.subscribe((eventData) => {
    const player = eventData.damagingEntity;
    const hitEntity = eventData.hitEntity;
    
    // Only process if the attacker is a player and there's a hit entity
    if (player.typeId === "minecraft:player" && hitEntity) {
        // Calculate distance between player and hit entity
        const playerPos = player.location;
        const targetPos = hitEntity.location;
        
        const distance = Math.hypot(
            playerPos.x - targetPos.x,
            playerPos.y - targetPos.y,
            playerPos.z - targetPos.z
        );

        // Check if the reach exceeds maximum allowed distance
        if (distance > MAX_SURVIVAL_REACH) {
            //console.warn(`Potential reach hack detected for player ${player.name}: ${distance.toFixed(2)} blocks`);
            world.sendMessage(`§c${player.name} might be using reach hacks! Distance: ${distance.toFixed(2)} blocks`);
        }
    }
});

