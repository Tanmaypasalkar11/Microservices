const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  createTodo,
  getTodos,
  updateTodo,
  getSingleTodo,
  deleteTodo,
  searchTodos,
} = require("../controllers/todo.controller");

const router = express.Router();

router.get("/search", authMiddleware, searchTodos);
router.get("/getAll", authMiddleware, getTodos);

router.post("/create", authMiddleware, createTodo);
router.get("/:id", authMiddleware, getSingleTodo);
router.patch("/:id", authMiddleware, updateTodo);
router.delete("/:id", authMiddleware, deleteTodo);

module.exports = router;
