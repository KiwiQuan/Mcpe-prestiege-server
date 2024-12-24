import { world } from "@minecraft/server";

/**
 * Creates a knockback system with configurable parameters
 * @param {Object} options Knockback configuration options
 * @param {number} options.cooldownTime Time in ms between knockbacks (default: 5) 
 * For example:
 * If cooldownTime = 5, there must be at least 5 milliseconds between knockbacks
 * 
 * If cooldownTime = 1000, there must be at least 1 second between knockbacks
 * 
If cooldownTime = 1000, there must be at least 1 second between knockbacks

If cooldownTime = 0, knockback will be applied on every hit with no delay

 * @param {number} options.sprintingForce Base force for sprinting hits (default: 0.1) I wouldn't recommend changing this
 * @param {number} options.normalForce Base force for normal hits (default: 0.1) I wouldn't recommend changing this
 * @param {number} options.sprintingHorizontal Horizontal multiplier when sprinting (default: 0.3)
 * @param {number} options.normalHorizontal Horizontal multiplier when not sprinting (default: 0.2)
 * @param {number} options.sprintingVertical Vertical multiplier when sprinting (default: 0.2)
 * @param {number} options.normalVertical Vertical multiplier when not sprinting (default: 0.1)
 * @param {boolean} options.enableFloaty Enable floaty knockback effect (default: false)
 * @param {number} options.floatyDuration Duration of slow falling in ticks (default: 10)
 * @param {number} options.floatyAmplifier Amplifier for slow falling effect (default: 1)
 * @returns {Function} Cleanup function to remove event listeners
 */

export function knockbackSystem({
    cooldownTime = 5,
    sprintingForce = 0.1,
    normalForce = 0.1,
    sprintingHorizontal = 0.3,
    normalHorizontal = 0.2, 
    sprintingVertical = 0.2,
    normalVertical = 0.1,
    enableFloaty = false,
    floatyDuration = 10,
    floatyAmplifier = 1
} = {}) {
    const knockbackCooldowns = new Map();

    // Hit handler
    const hitHandler = ({ damagingEntity, hitEntity }) => {
        if (hitEntity.hasTag("InPVP") || damagingEntity.hasTag("InPVP")) {
            if (!damagingEntity.isValid()) return;

            const now = Date.now();
            const lastCooldownTime = knockbackCooldowns.get(damagingEntity);

            if (lastCooldownTime !== undefined && now - lastCooldownTime < cooldownTime) return;

            const direction = damagingEntity.getViewDirection();
            const force = damagingEntity.isSprinting ? sprintingForce : normalForce;
            const horizontalMultiplier = damagingEntity.isSprinting ? sprintingHorizontal : normalHorizontal;
            const verticalMultiplier = damagingEntity.isSprinting ? sprintingVertical : normalVertical;

            hitEntity.applyKnockback(
                direction.x * force,
                direction.z * force,
                horizontalMultiplier,
                verticalMultiplier
            );

            // Apply floaty effect if enabled
            if (enableFloaty) {
                hitEntity.addEffect("slow_falling", floatyDuration, {amplifier: floatyAmplifier, showParticles: false});
            }

            knockbackCooldowns.set(damagingEntity, now);
        }
    };

    // Leave handler
    const leaveHandler = ({ player }) => knockbackCooldowns.delete(player);

    // Subscribe to events
    world.afterEvents.entityHitEntity.subscribe(hitHandler);
    world.beforeEvents.playerLeave.subscribe(leaveHandler);

    // Return cleanup function
    return () => {
        world.afterEvents.entityHitEntity.unsubscribe(hitHandler);
        world.beforeEvents.playerLeave.unsubscribe(leaveHandler);
    };
}
/*
knockbackSystem({
    cooldownTime: 5,
    sprintingForce: 0.1,
    normalForce: 0.1,
    sprintingHorizontal: 0.05,
    normalHorizontal: 0.3,
    sprintingVertical: 0.1,
    normalVertical: 0.07,
    enableFloaty: true,
    floatyDuration: 5,
    floatyAmplifier: 0.5
});*/