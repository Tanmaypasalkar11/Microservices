const todo = require("../models/todo.model");
const { createTodoSchema, updateTodoSchema } = require("../types/todo.types");
const mongoose = require("mongoose");

const createTodo = async (req, res) => {
  const validTodo = createTodoSchema.safeParse(req.body);
  if (!validTodo.success) {
    return res.status(400).json({
      message: "Invalid Data",
      error: validTodo.error.errors,
    });
  }
  try {
    const newTodo = await todo.create({
      title: validTodo.data.title,
      description: validTodo.data.description,
      completed: validTodo.data.completed || false,
      userId: new mongoose.Types.ObjectId(req.user.userId),
    });
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const getTodos = async (req, res) => {
  try {
    // Read query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Pagination math
    const skip = (page - 1) * limit;
    const todos = await todo
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count for frontend
    const totalTodos = await todo.countDocuments({ userId: req.user.userId });

    res.status(200).json({
      page,
      limit,
      totalTodos,
      totalPages: Math.ceil(totalTodos / limit),
      todos,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const updateTodo = async (req, res) => {
  const validTodo = updateTodoSchema.safeParse(req.body);
  if (!validTodo.success) {
    return res.status(400).json({
      message: "Invalid Data",
      error: validTodo.error.errors,
    });
  }
  try {
    const todoID = req.params.id;
    const updatedTodo = await todo.findOneAndUpdate(
      { _id: todoID, userId: req.user.userId },
      { $set: validTodo.data },
      { new: true },
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const getSingleTodo = async (req, res) => {
  try {
    const todoID = req.params.id;
    const singleTodo = await todo.findOne({
      _id: todoID,
      userId: req.user.userId,
    });
    if (!singleTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json(singleTodo);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const todoID = req.params.id;
    const deletedTodo = await todo.findOneAndDelete({
      _id: todoID,
      userId: req.user.userId,
    });
    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const searchTodos = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res
        .status(400)
        .json({ message: "Query parameter 'q' is required" });
    }
    const todos = await todo.find({
      userId: req.user.userId,
      $text: { $search: q },
    });

    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  getSingleTodo,
  deleteTodo,
  searchTodos,
};
