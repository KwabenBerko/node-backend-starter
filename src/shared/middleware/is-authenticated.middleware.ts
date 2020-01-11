import { Request, Response, NextFunction } from "express";
import { TokenUtil } from "../util/token.util";
import { UserService } from "../../user/user.service";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
   try{
      const data = await TokenUtil.decodeToken(String(req.headers.authorization));
      const user = await UserService.findByIdOrThrow(data["id"]);
      req.currentUser = user;
      next();
   }
   catch(err){
      return next(err);
   }
}