import { Router } from "express";
import requests from "./requests.routes";
import admin from "./admin.routes";
import auth from "./auth.routes";
import sales from "./sales.routes";
import academy from "./academy.routes";
import attendance from "./attendance.routes";
import secretary from "./secretary.routes";

const api = Router();

api.use("/requests", requests);
api.use("/admin", admin);
api.use("/auth", auth);
api.use("/academy", academy);
api.use("/attendance", attendance);
api.use("/secretary", secretary);
api.use("/", sales);

export default api;
