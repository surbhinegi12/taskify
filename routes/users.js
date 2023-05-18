var express = require("express");
var router = express.Router();
const DB = require("../services/DB");
const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
  try {
    const users = await DB("users").select(["id", "name", "password", "email"]);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  try {
    const [existingUser] = await DB("users").where({ email });
    if (existingUser) {
      return res.status(400).send("User with this email already exists");
    }
    const [newUser] = await DB("users")
      .insert({
        name,
        email,
        password: hash,
      })
      .returning("id");
    res.status(201).send(`User with id ${newUser.id} created`);
  } catch (err) {
    if (err.code === "23502") {
      return res.status(400).send("Required field missing");
    } else {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    await DB("users")
      .where({ email })
      .first()
      .then((user) => {
        if (!user) {
          res.status(401).send("Invalid email or password");
        } else {
          bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
              res.status(200).send(`Login successfull`);
            } else {
              res.status(401).send("Invalid email or password");
            }
          });
        }
      });
  } catch (err) {
    res.json(err);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await DB("tasks").whereIn("todoId", function () {
        this.select("id").from("todos").where("userId", id);
      }).delete();
      await DB("todos").where({ userId: id }).delete();
    const result = await DB("users").where({ id: id }).delete();

    if (result != 0) {
      res.status(200).send(`User with id ${id} deleted`);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
