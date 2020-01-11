import { PhoneNumberUtil } from "google-libphonenumber";

export namespace ValidationUtil {
    export const isValidEnum = (enumObject: any, str: string): boolean => {
        
        return Object.values(enumObject).some((val:any) => {
            if(typeof val == "string"){
                val = val.toLowerCase();
            }
            return val === str.toLowerCase();
        });
    }
    
    export const isValidEmail = (email: string): boolean => {
        return new RegExp(
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        ).test(email);
    }
    
    export const isValidPhoneNumber = (phoneNumber: string): boolean => {
        const phoneNumberUtil = PhoneNumberUtil.getInstance();
        try {
          phoneNumberUtil.parse(phoneNumber);
          return true;
        } catch (error) {
          return false;
        }
    }
    
    export const isValidName = (name: string): boolean => {
        return new RegExp("[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{0,20}$").test(name);
    }
    
    export const isValidPassword = (password: string): boolean => {
        return password.length >= 6
    }
    
    export const arePasswordsTheSame = (passwordOne: string, passwordTwo: string) => {
        return isValidPassword(passwordOne) && passwordOne === passwordTwo
    }

    export const isValidSmsMessage = (message: string) => {
        // The maximum length of text message that you can send is 160 characters
        // https://www.twilio.com/docs/glossary/what-sms-character-limit
        return message.length >= 3 && message.length <= 160;
    }
}