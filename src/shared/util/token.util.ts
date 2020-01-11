import jsonwebtoken from "jsonwebtoken";
import moment from "moment";
import { UnAuthorizedError } from "../errors/unauthorized.error";
import { MessageUtil } from "./message.util";

export interface Token {
    accessToken: string,
    expiresInMillis: number,
    tokenType: "Bearer",
}

export namespace TokenUtil {
    export const createToken = (payload: any): Token => {

        const expiresInSeconds = Math.ceil(moment().add(14, "days").diff(moment()) / 1000);

        const accessToken = jsonwebtoken.sign(
            payload,
            String(process.env.JSON_WEB_TOKEN_SECRET),
            { expiresIn: expiresInSeconds }
        )

        return {
            accessToken,
            expiresInMillis: expiresInSeconds * 1000,
            tokenType: "Bearer"
        }
    }

    export const decodeToken = async (token: string): Promise<any> => {
        if(!token){
            throw new UnAuthorizedError(MessageUtil.INVALID_AUTHORIZATION_TOKEN);
        }

        const splitted = token.split(" ");

        if(splitted[0] !== "Bearer"){
            throw new UnAuthorizedError(MessageUtil.INVALID_AUTHORIZATION_TOKEN);
        }

        return new Promise(async (resolve, reject) => {
            jsonwebtoken.verify(splitted[1], String(process.env.JSON_WEB_TOKEN_SECRET), (err, decoded) => {
                if(err){
                    return reject(new UnAuthorizedError(MessageUtil.INVALID_AUTHORIZATION_TOKEN));
                }

                resolve(decoded);
            });
            
        })
    }
}