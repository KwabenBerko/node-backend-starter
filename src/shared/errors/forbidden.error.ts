import { MessageUtil } from "../util/message.util";

export class ForbiddenError extends Error{
    constructor(message: string = MessageUtil.PERMISSION_DENIED){
        super(message);
    }
}