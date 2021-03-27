import tl = require('azure-pipelines-task-lib');
import got from 'got';

async function run() {
    try {
        const datasetName: string = tl.getInput("datasetName", true)!;
        const teamId: string = tl.getInput("teamId", true)!;
        const marker: string = tl.getInput("marker", true)!;
        const type: string = tl.getInput("type", true)!;
        const startTime = getStartTime(tl.getInput("startTime", false));
        const endTime = getEndTime(tl.getInput("endTime", false));

        if (endTime !== undefined && startTime > endTime) {
            throw new Error();
        }

        await createMarker(datasetName, teamId, marker, type, startTime, endTime);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

async function createMarker(datasetName: string,
    teamId: string,
    marker: string,
    type: string,
    startTime: number,
    endTime: number | undefined) {

    const client = got.extend({
        headers: { "X-Honeycomb-Team": teamId }
    });

    const uri = `https://api.honeycomb.io/1/markers/${datasetName}`;
    const response = await client.post(uri, {
        json: {
            message: marker,
            type: type,
            startTime: startTime,
            endTime: endTime
        },
        responseType: 'json'
    });

    if (response.statusCode !== 200) {
        throw new Error();
    }
}

function getStartTime(startTime: string | undefined): number {
    if (startTime === undefined) {
        return new Date().getDate() / 1000;
    }

    const startTimeAsNumber: number = Number(startTime);
    if (isNaN(startTimeAsNumber)) {
        throw new Error("")
    }
    if (startTimeAsNumber < 0) {
        throw new Error();
    }
    return startTimeAsNumber;
}

function getEndTime(endTime: string | undefined): number | undefined {
    if (endTime === undefined) {
        return endTime;
    }

    const endTimeAsNumber: number = Number(endTime);
    if (isNaN(endTimeAsNumber)) {
        throw new Error("")
    }
    if (endTimeAsNumber < 0) {
        throw new Error();
    }
    return endTimeAsNumber;
}

run();