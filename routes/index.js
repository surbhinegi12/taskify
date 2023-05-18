require("dotenv").config();
var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  try {
    var users = [
      "login (post) route : /users/login",
      "signup (post) route : /users/signup",
      "delete account (delete) route : /users/:id",
      "logout (post) route : /users/logout",
    ];
    var todos = [
      "view todos (get) route : /todos",
      "add todo (post) route : /todos/addTodo",
      "update todo (put) route : /todos/updateTodo",
      "delete todo (delete) route : /todos/:id",
    ];

    res.status(200).json({ users, todos });
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
