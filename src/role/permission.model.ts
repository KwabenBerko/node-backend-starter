export class Permission {
    id: number;
    name: string;

    constructor(data: {
        name: string
    }){
        this.id = 0;
        this.name = data.name
    }
}