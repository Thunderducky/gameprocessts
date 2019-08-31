import chalk from "chalk";

import {Timer} from "./src/Timer"
import {GameProcess, GameProcessEventList} from "./src/GameProcess"
import { PUBSUB } from './src/Pubsub'
/**
 * An interface used with any game processes
 */

const td = {
    ticksAccumulated: 0,
    ticksNeeded:10,
};
const events: GameProcessEventList = {
    onStart: () => {
        console.log(chalk.green("Started Building Solar Panel"))
    },
    onTick: (gp) => {
        td.ticksAccumulated++;
        console.log(chalk.green(`Building Progress ${td.ticksAccumulated}/${td.ticksNeeded}`))
            if(td.ticksAccumulated >= td.ticksNeeded){
                gp.complete();
            }
    },
    onComplete: () => {
        console.log(chalk.blue("Construction finished!"));
    },
    onCancel: () => {
        console.log(chalk.red("Construction Cancelled"));
    },
    onPause: () => {
        console.log("PAUSED");
    },
    onResume: () => {
        console.log("RESUMED");
    }
}
// const gp = new GameProcess(events);
// gp.start();
// // This is a timer with a process attached directly
// const t = new Timer((tickCount: number) => {
//     if(!gp.completed && !gp.cancelled && !gp.paused){
//         gp.tick(tickCount);
//     }
// }, 100).start();

// setTimeout(() => {
//     gp.pause();
// }, 300)

// setTimeout(() => {
//     gp.resume();
// }, 1600);

const stationStore = {
    carbon: 100,
    iron: 20
}

const buildingCost = {
    carbon: 20,
    iron: 10
}
const buildData = {
    ticksRequired: 10,
    ticksAcquired: 0
}
const buildings: any[] = [];

// Let's hardcode this part happenings
console.log("STARTING BUILDINGS", buildings);
console.log("CHECKING FOR RESOURCES");
// Let's do the first model where we just withdraw the resources on start
console.log("BEFORE", stationStore)
console.log("WITHDRAWING", buildingCost)
console.log("AFTER", stationStore)

// Start up our cycler
// add buildings at different points along the way and monitor them
const blueprint = {
    buildingName: "solar-panel",
    resourceCost: {
        iron:10,
        carbon:20
    },
    buildTicksRequired: 10 // this is just a measure of time for the system to work off of
}

// Build a process based off of this blueprint

// should be able to do a request handle
const buildProcessFromBlueprint = (blueprint: any, resourceStore: any): {data: any, process: GameProcess} => {
    const data = {
        blueprint,
        resourceReserve: {
            iron: 0,
            carbon: 0
        },
        ticksAcquired: 0,
        ticksRequired: blueprint.buildTicksRequired
    };
    const process = new GameProcess({
        onStart(gameProcess){
            const { resourceReserve } = data;
            // the process is not responsible right now for checking if it's possible, it just pulls the resources
            // We'll try doing cancelling here
            const cost = data.blueprint.resourceCost;
            if(resourceStore.iron < cost.iron || resourceStore.carbon < cost.carbon){
                console.log("INSUFFICIENT RESOURCES CANCELLING")
                gameProcess.cancel();
                return;
            }
            resourceReserve.iron += cost.iron;
            resourceStore.iron -= cost.iron;

            resourceReserve.carbon += cost.carbon;
            resourceStore.carbon -= cost.carbon;
            console.log("PROCESS STARTED");
        },
        onTick(gameProcess){
            
            // we assume that everyone is calling us perfectly
            data.ticksAcquired++;
            console.log(chalk.blue(`${data.blueprint.buildingName} ${data.ticksAcquired}/${data.ticksRequired}`));
            if(data.ticksAcquired >= data.ticksRequired){
                
                gameProcess.complete()
            }

        },
        onComplete(){
            console.log("PROCESS COMPLETED");
            const { resourceReserve } = data;
            // Zero out our reserves
            resourceReserve.iron = 0;
            resourceReserve.carbon = 0;
            // we should technically also add our building to the list afterwards
            buildings.push(data.blueprint.buildingName) // either that or publish the event, at the very least we could extricate this with publishing
            
        },
        onCancel(){
            console.log("CANCELLED");
            // return any resources we acquired, if we cancel early this will be zero because we didn't have the chance to acquire it yet
            const { resourceReserve } = data;
            resourceStore.iron += resourceReserve.iron;
            resourceStore.iron = 0;

            resourceStore.carbon += resourceReserve.carbon;
            resourceStore.carbon = 0;
        }
    });
    return {
        data,
        process
    }
}



const cycleTime = 500;
// buildProcess.start();
// buildProcess2.start();
const buildProcesses:any[] = []

const processAndData = buildProcessFromBlueprint(blueprint, stationStore);
processAndData.process.start();
buildProcesses.push(processAndData.process)
let intervalId = setInterval(() => {
    buildProcesses.forEach(buildProcess => {
        if(!buildProcess.completed && !buildProcess.cancelled){
            buildProcess.tick()
        } else if(buildProcess.completed){
            console.log("done");
            console.log(stationStore);
            clearInterval(intervalId);
        } else if(buildProcess.cancelled){
            console.log("cancelled");
            console.log(stationStore);
            clearInterval(intervalId);
        }
    })
}, cycleTime)

setTimeout(() => {
    processAndData.process.cancel();
}, cycleTime*4)
