import bcrypt from "bcrypt";

export namespace PasswordHasherUtil {
    export const hashPassword = async (plainText: string): Promise<string> => {
        return await bcrypt.hash(plainText, 10);
    }
    
    export const comparePassword = async (plainText: string, hash: string): Promise<boolean> => {
        return await bcrypt.compare(plainText, hash);
    }
}