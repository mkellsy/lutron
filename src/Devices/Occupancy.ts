import * as Leap from "@mkellsy/leap";

import equals from "deep-equal";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Occupancy extends Common implements Device {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Device) {
        super(DeviceType.Occupancy, processor, area, device);
    }

    public update(status: Leap.AreaStatus): void {
        const previous = { ...this.status };

        this.state = {
            state: status.OccupancyStatus != null ? status.OccupancyStatus === "Occupied" ? "Occupied" : "Unoccupied" : "Unknown",
            level: status.Level,
        };

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }
}
