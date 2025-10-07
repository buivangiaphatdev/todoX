import express from "express";
import {
  deleteTask,
  getAllTasks,
  createTask,
  updateTask,
} from "../controller/tasksController.js";

const router = express.Router();

router.get("/", getAllTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
