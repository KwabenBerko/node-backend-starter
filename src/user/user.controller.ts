import express from "express";
import { isAuthenticated } from "../shared/middleware/is-authenticated.middleware";
import { UserService } from "./user.service";

export default express.Router()

.post("/signup", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try{
        const user = await UserService.register(req.body);
        res.status(201).json(user.toDTO());
    }
    catch(err){
        return next(err);
    }
})