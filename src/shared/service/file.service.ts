import path from "path";
import { BadRequestError } from "../errors/bad-request.error";
import { MessageUtil } from "../util/message.util";
import { FileDTO } from "../dto/file.dto";

export namespace FileService {

    export const uploadFile = async (dto: FileDTO): Promise<string> => {

        if(!(dto.name && dto.data)){
            throw new BadRequestError(MessageUtil.INVALID_REQUEST_DATA);
        }

        if(!(path.extname(dto.name))){
            throw new BadRequestError(MessageUtil.INVALID_FILE_NAME);
        }

        //Checking if file size is greater than 4MB.
        if((dto.data.byteLength / (1024*1024)) > 4){
            throw new BadRequestError(MessageUtil.INVALID_FILE_SIZE)
        }
        
        throw new Error();
    }

    export const deleteFile = async (url: string): Promise<void> => {
        throw new Error();
    }

}