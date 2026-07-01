import { Router } from "express";
import requests from "./requests.routes";
import admin from "./admin.routes";
import auth from "./auth.routes";
import sales from "./sales.routes";

const api = Router();

api.use("/requests", requests);
api.use("/admin", admin);
api.use("/auth", auth);
api.use("/", sales);

export default api;
