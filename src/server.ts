import dotenv from "dotenv";
import http from "http";
import express from "express";
import { AddressInfo } from "net";
import { MessageUtil } from "./shared/util/message.util";
import UserController from "./user/user.controller";
import { NotFoundError } from "./shared/errors/not-found.error";
import { ForbiddenError } from "./shared/errors/forbidden.error";
import { BadRequestError } from "./shared/errors/bad-request.error";
import { ConflictError } from "./shared/errors/conflict.error";
import { UnAuthorizedError } from "./shared/errors/unauthorized.error";
import { Model } from "objection";
import { knex } from "./shared/database";
import morgan from "morgan";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const server = http.createServer(app);

//Server Middlewares
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//API Controllers
app.use("/users", UserController);

app.use((req, res, next) => {
    return next(new NotFoundError(MessageUtil.ROUTE_NOT_FOUND))
})

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    let status: number = 500;

    switch (err.constructor) {
        case BadRequestError:
            status = 400;
            break;
        case ConflictError:
            status = 409;
            break;
        case ForbiddenError:
            status = 403;
            break;
        case NotFoundError:
            status = 404;
            break;
        case UnAuthorizedError:
            status = 401
    }

    return res.status(status).json({
        error: {
            status,
            message: err.message || MessageUtil.INTERNAL_SERVER_ERROR
        }
    })
})

server.listen(process.env.PORT || 3000, () => {
    //Bind Database Models
    Model.knex(knex);
    console.log(`Server Running on port: ${(server.address() as AddressInfo)["port"]}`)
})


export {
    server
};
