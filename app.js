var express = require("express");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// var tasksRouter = require("./routes/tasks");
var todosRouter = require("./routes/todos");

var app = express();

const port = 3001;
app.use(express.json());

// app.use("/", indexRouter);
// app.use("/users", membersRouter);
// app.use("/tasks", tasksRouter);
// app.use("/todos", todosRouter);

app.listen({ port, host: "0.0.0.0" }, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
