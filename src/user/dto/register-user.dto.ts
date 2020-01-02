export class RegisterUserDTO {
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;

    constructor(data: {
        firstName: string;
        lastName: string;
        gender: string;
        email: string;
        phoneNumber: string;
        password: string;
        confirmPassword: string;
    }){
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.gender = data.gender;
        this.email = data.email;
        this.phoneNumber = data.phoneNumber;
        this.password = data.password,
        this.confirmPassword = data.confirmPassword
    }
}