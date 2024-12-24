import { world, system } from "@minecraft/server";

const clickHistory = new Map();
const CPS_TIME_WINDOW = 1000; // 1 second window for CPS calculation

export function cpsCounter() {
    // Track clicks on hit
    world.afterEvents.entityHitEntity.subscribe((eventData) => {
        const player = eventData.damagingEntity;
        if (player.typeId !== "minecraft:player") return;

        const currentTime = Date.now();
        const playerClicks = clickHistory.get(player.id) || [];
        playerClicks.push(currentTime);
        
        // Remove clicks outside the time window
        while (playerClicks.length > 0 && playerClicks[0] < currentTime - CPS_TIME_WINDOW) {
            playerClicks.shift();
        }
        
        clickHistory.set(player.id, playerClicks);
    });

    // Update CPS display every tick (20 times per second)
    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            const currentTime = Date.now();
            const playerClicks = clickHistory.get(player.id) || [];
            
            // Clean old clicks
            const validClicks = playerClicks.filter(time => time > currentTime - CPS_TIME_WINDOW);
            clickHistory.set(player.id, validClicks);

            // Calculate CPS
            const currentCPS = (validClicks.length / CPS_TIME_WINDOW) * 1000;
            
            // Display CPS
            player.runCommand(`title @s actionbar §e${currentCPS.toFixed(1)} CPS`);

            // Clear history if no recent clicks
            if (validClicks.length === 0) {
                clickHistory.delete(player.id);
            }
        }
    }, 1); // Run every tick (1 = 1 tick)

    // Cleanup when player leaves
    world.beforeEvents.playerLeave.subscribe(({ player }) => {
        clickHistory.delete(player.id);
    });
}
