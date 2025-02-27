import { MessageType } from "./MessageType";
import { ResponseStatus } from "./ResponseStatus";

/**
 * Creates a response header object.
 * @private
 */
export class ResponseHeader {
    public StatusCode?: ResponseStatus;
    public Url?: string;
    public MessageBodyType?: MessageType;
    public ClientTag?: string;
}
