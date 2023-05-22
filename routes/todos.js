var express = require("express");
const { verifyToken } = require("../validations/middleware");
var router = express.Router();
const DB = require("../services/DB");



router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const todos = await DB.select([
        "todos.id",
        "todos.title",
        DB.raw(
            "jsonb_agg(jsonb_build_object('deadline' ,tasks.deadline,'description',tasks.description, 'status', tasks.status)) as taskDetails"
            ),
      ])
      .from("todos")
      .where("todos.userId", userId)
      .join("tasks", "todos.id", "tasks.todoId")
      .groupBy("todos.id");

    res.status(200).json(todos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching todos" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, tasks } = req.body;
    const userId = req.userId;

    const result = await DB.transaction(async (trx) => {
      const [todo] = await DB("todos")
        .insert(
          {
            userId,
            title,
          },
          "id"
        )
        .transacting(trx);

      const taskPromises = tasks.map((task) => {
        return DB("tasks")
          .insert({
            todoId: todo.id,
            deadline: task.deadline,
            description: task.description,
            createdAt: new Date(),
            priority: task.priority,
          })
          .transacting(trx);
      });

      await Promise.all(taskPromises);

      return todo;
    });

    res
      .status(201)
      .json({ message: "Todo added successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while adding the todo" });
  }
});

router.put("/:todoId", verifyToken, async (req, res) => {
  try {
    const { todoId } = req.params;
    const { taskId, deadline, description, priority } = req.body;

    if (taskId) {
      await DB("tasks")
        .where({ id: taskId, todoId })
        .update({ deadline, description, priority });
      res.status(200).json({ message: "Task updated successfully" });
    } else {
      await DB("tasks").insert({ todoId, deadline, description, priority });
      res.status(200).json({ message: "Task added successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating/adding the task" });
  }
});


module.exports = router;
