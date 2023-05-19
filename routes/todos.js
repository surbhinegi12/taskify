var express = require("express");
const { verifyToken } = require("../validations/middleware");
var router = express.Router();
const DB = require("../services/DB");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const todos = await DB("todos")
      .select(
        "todos.id",
        "todos.title",
        "tasks.createdAt",
        "tasks.deadline",
        "tasks.description"
      )
      .where("todos.userId", userId)
      .leftJoin("tasks", "todos.id", "tasks.todoId");

    res.status(200).json(todos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching todos" });
  }
});

router.post("/todos", verifyToken, async (req, res) => {
  try {
    const { title, tasks } = req.body;
    const userId = req.userId;

    const todo = await DB("todos").insert({
      userId,
      title,
    });

    const taskPromises = tasks.map((task) => {
      return DB("tasks").insert({
        todoId: todo[0],
        deadline: task.deadline,
        description: task.description,
        createdAt: new Date(),
        priority: task.priority,
      });
    });

    await Promise.all(taskPromises);

    res.status(201).json({ message: "Todo added successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while adding the todo" });
  }
});

module.exports = router;
