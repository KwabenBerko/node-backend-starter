import { expect } from "../setup";
import { FileService } from "../../../src/shared/service/file.service"
import { BadRequestError } from "../../../src/shared/errors/bad-request.error";
import { MessageUtil } from "../../../src/shared/util/message.util";
import { fileDTO } from "../data.factory";
import { FileDTO } from "../../../src/shared/dto/file.dto";


describe("File Service", () => {
    describe("Upload File", () => {

        it("should throw BadRequestError if file DTO is invalid", async () => {
            const dto: Partial<FileDTO> = {
                ...fileDTO,
                name: "cat",
                data: undefined
            };
            await expect(FileService.uploadFile(dto as FileDTO)).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_REQUEST_DATA);
        })

        it("should throw BadRequestError if filename does not have extension", async () => {
            await expect(FileService.uploadFile({
                ...fileDTO,
                name: "cat"
            })).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_FILE_NAME);
        })

        it("should throw BadRequestError if filename does not have extension", async () => {
            await expect(FileService.uploadFile({
                ...fileDTO,
                data: {...fileDTO.data, byteLength: 6000000} as Buffer
            })).to.be.eventually.rejectedWith(BadRequestError, MessageUtil.INVALID_FILE_SIZE);
        })
    })
})