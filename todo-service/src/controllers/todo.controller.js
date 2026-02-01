const todo = require("../models/todo.model");
const { createTodoSchema, updateTodoSchema } = require("../types/todo.types");
const mongoose = require("mongoose");
const asyncHandler = require("../utilite/asyncHandler");

// CREATE TODO
const createTodo = asyncHandler(async (req, res) => {
  const validTodo = createTodoSchema.safeParse(req.body);

  if (!validTodo.success) {
    return res.status(400).json({
      message: "Invalid Data",
      error: validTodo.error.errors,
    });
  }

  const newTodo = await todo.create({
    title: validTodo.data.title,
    description: validTodo.data.description,
    completed: validTodo.data.completed || false,
    userId: new mongoose.Types.ObjectId(req.user.userId),
  });

  res.status(201).json(newTodo);
});

// GET TODOS (PAGINATED)
const getTodos = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 10);
  const skip = (page - 1) * limit;

  const todos = await todo
    .find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalTodos = await todo.countDocuments({
    userId: req.user.userId,
  });

  res.status(200).json({
    page,
    limit,
    totalTodos,
    totalPages: Math.ceil(totalTodos / limit),
    todos,
  });
});

// UPDATE TODO
const updateTodo = asyncHandler(async (req, res) => {
  const validTodo = updateTodoSchema.safeParse(req.body);

  if (!validTodo.success) {
    return res.status(400).json({
      message: "Invalid Data",
      error: validTodo.error.errors,
    });
  }

  const updatedTodo = await todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { $set: validTodo.data },
    { new: true },
  );

  if (!updatedTodo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(200).json(updatedTodo);
});

// GET SINGLE TODO
const getSingleTodo = asyncHandler(async (req, res) => {
  const singleTodo = await todo.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!singleTodo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(200).json(singleTodo);
});

// DELETE TODO
const deleteTodo = asyncHandler(async (req, res) => {
  const deletedTodo = await todo.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!deletedTodo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(200).json({ message: "Todo deleted successfully" });
});

// SEARCH TODOS
const searchTodos = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Query parameter 'q' is required" });
  }

  const todos = await todo.find({
    userId: req.user.userId,
    $text: { $search: q },
  });

  res.status(200).json(todos);
});

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  getSingleTodo,
  deleteTodo,
  searchTodos,
};
