import express from "express";
import { getSosContacts } from "../controllers/sosController.js";
 
const router = express.Router();
 
router.get("/nearby", getSosContacts); 
 
export default router;
