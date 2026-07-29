import express, { Application, NextFunction, Request, Response } from "express";
import userRouter from "./routes/user.route";
import adminRouter from "./routes/admin.route";
import feedbackRouter from "./routes/feedback.route";
import campaignRouter from "./routes/campaign.route";
import notificationRouter from "./routes/notification.route";
import pickupRouter from "./routes/pickup.route";
import recycleCenterRouter from "./routes/recycle-center.route";
import { HttpException } from "./exception/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import cors from "cors";
import path from "path";
import multer from "multer";

const app: Application = express();

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded

// CORS
app.use(cors());


app.use((req: Request, res: Response, next: NextFunction) => {
    console.log("➡️", req.method, req.url);
    next();
});


app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);


app.use("/api/v1/auth", userRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/campaigns", campaignRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/admin/users", adminRouter);
app.use("/api/v1/pickups", pickupRouter);
app.use("/api/v1/recycle-centers", recycleCenterRouter);

/* =========================
   HEALTH CHECK
   ========================= */
app.get("/", (req: Request, res: Response) => {
    return res.send("Hello, TypeScript-Express!");
});

const PORT: number = 5000;

/* =========================
   404 HANDLER
   ========================= */
app.use((req: Request, res: Response) => {
    return res.status(404).json({ message: "API not found" });
});

/* =========================
   GLOBAL ERROR HANDLER
   ========================= */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);

    if (err instanceof HttpException) {
        return ApiResponseHelper.error(res, err.message, err.status);
    }

    if (err instanceof multer.MulterError) {
        return ApiResponseHelper.error(res, err.message, 400);
    }

    if (err.message === "Only image uploads are allowed") {
        return ApiResponseHelper.error(res, err.message, 400);
    }

    return ApiResponseHelper.error(res, "Internal Server Error", 500);
});

/* =========================
   EXPORTS
   ========================= */
const DUMMY: string = "Dummy Export";

export {
    PORT,
    DUMMY
};

export default app;