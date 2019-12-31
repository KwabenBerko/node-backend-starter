import { MessageUtil } from "../util/message.util";

export class BadRequestError extends Error {
    constructor(message: string = MessageUtil.INVALID_REQUEST_DATA){
        super(message);
    }
}