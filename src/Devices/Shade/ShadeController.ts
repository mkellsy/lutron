import equals from "deep-equal";

import { DeviceType, ZoneStatus } from "@mkellsy/hap-device";

import { AreaAddress } from "../../Response/AreaAddress";
import { Common } from "../Common";
import { Processor } from "../Processor/Processor";
import { Shade } from "./Shade";
import { ShadeState } from "./ShadeState";
import { ZoneAddress } from "../../Response/ZoneAddress";

/**
 * Defines a window shade device.
 * @public
 */
export class ShadeController extends Common<ShadeState> implements Shade {
    /**
     * Creates a window shade device.
     *
     * ```js
     * const shade = new Shade(processor, area, zone);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param zone The zone assigned to this device.
     */
    constructor(processor: Processor, area: AreaAddress, zone: ZoneAddress) {
        super(DeviceType.Shade, processor, area, zone, {
            state: "Closed",
            level: 0,
            tilt: 0,
        });

        this.fields.set("state", { type: "String", values: ["Open", "Closed"] });
        this.fields.set("level", { type: "Integer", min: 0, max: 100 });
        this.fields.set("tilt", { type: "Integer", min: 0, max: 100 });
    }

    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * shade.update({ Level: 100 });
     * ```
     *
     * @param status The current device state.
     */
    public update(status: ZoneStatus): void {
        const previous = { ...this.status };

        if (status.Level != null) {
            this.state.state = status.Level > 0 ? "Open" : "Closed";
            this.state.level = status.Level;
        }

        if (status.Tilt != null) this.state.tilt = status.Tilt;
        if (this.initialized && !equals(this.state, previous)) this.emit("Update", this, this.state);

        this.initialized = true;
    }

    /**
     * Controls this device.
     *
     * ```js
     * shade.set({ state: "Open", level: 50, tilt: 50 });
     * ```
     *
     * @param status Desired device state.
     */
    public set(status: ShadeState): Promise<void> {
        const waits: Promise<void>[] = [];

        waits.push(
            this.processor.command(this.address, {
                CommandType: "GoToLevel",
                Parameter: [{ Type: "Level", Value: status.state === "Closed" ? 0 : status.level }],
            }),
        );

        if (status.tilt != null || status.state === "Closed") {
            waits.push(
                this.processor.command(this.address, {
                    CommandType: "TiltParameters",
                    TiltParameters: { Tilt: status.state === "Closed" ? 0 : status.tilt },
                }),
            );
        }

        return Promise.all(waits) as unknown as Promise<void>;
    }
}
