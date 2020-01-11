export class FileDTO {
    name: string;
    data: Buffer;

    constructor(data: {
        name: string,
        data: Buffer
    }){
        this.name = data.name;
        this.data = data.data;
    }
}