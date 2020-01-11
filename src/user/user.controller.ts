import express from "express";

export default express.Router()

.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.json({
        message: "Hello World!"
    });
})