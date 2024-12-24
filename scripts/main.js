import { world} from "@minecraft/server";
import { reachDetection } from "./reachFlag.js";
import {cpsCounter} from "./cpsCounter.js";
import { knockbackSystem } from "./knockback.js";


cpsCounter();

// Example of using reachDetection with custom values:
/*
reachDetection({
    maxSurvivalReach: 4.5,
    sprintResetBuffer: 2.0,
    violationThreshold: 5
});
*/

reachDetection();




// Example of using knockbackSystem with custom values:
/*
knockbackSystem({
    cooldownTime: 5,
    sprintingForce: 0.1,
    normalForce: 0.1,
    sprintingHorizontal: 0.3,
    normalHorizontal: 0.2,
    sprintingVertical: 0.2,
    normalVertical: 0.1,
    enableFloaty: true,
    floatyDuration: 5,
    floatyAmplifier: 0.5
});
*/

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
});

