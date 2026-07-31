import dotenv from "dotenv";
dotenv.config(); // implement .env file

// Add fallback value from env for stability
export const PORT: number = Number(process.env.PORT) || 8089; // default port is 8089
export const DUMMY: string = process.env.DUMMY || "Dummy Export";    
export const MONGODB_URL: string = process.env.MONGODB_URL || "mongodb://localhost:27017/class-36a-db"; // default MongoDB URL
export const SECRET_KEY: string =
    process.env.SECRET_KEY || "merosecretkey";
export const EMAIL_USER: string = process.env.EMAIL_USER || "jessicad10@gmail.com";
export const EMAIL_PASS: string = process.env.EMAIL_PASS || "cnkecvfckziitrid";
export const FRONTEND_URL: string =
    process.env.FRONTEND_URL || "http://192.168.1.73:3000";

// same as 
// export {
//     PORT,
//     DUMMY,
//     MONGODB_URL
// }