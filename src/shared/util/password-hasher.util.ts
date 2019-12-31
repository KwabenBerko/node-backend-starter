export namespace PasswordHasherUtil {
    export const hashPassword = (plainText: string): Promise<string> => {
        throw new Error();
    }
    
    export const comparePassword = (plainText: string, hash: string): Promise<boolean> => {
        throw new Error();
    }
}