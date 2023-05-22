var express = require("express");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../validations/middleware");

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
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    const [newUser] = await DB("users")
      .insert({
        name,
        email,
        password: hash,
      })
      .returning("id");
    res.status(201).json({ msg: `User with id ${newUser.id} created`});
  } catch (err) {
    if (err.code === "23502") {
      return res.status(400).json({ error: "Required field missing" });
    } else {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
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
          res.status(401).json({ error: "Invalid email or password" });
        } else {
          bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
              const secretKey = process.env.SECRET_KEY;

              const token = jwt.sign({ userId: user.id }, secretKey, {
                expiresIn: "1h",
              });
              res
                .status(200)
                .json({ msg: "Login successfull" ,token:token});
            } else {
              res.status(401).json({ error: "Invalid email or password" });
            }
          });
        }
      });
  } catch (err) {
    res.json(err);
  }
});

router.post("/logout", verifyToken, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    res.clearCookie(token);

    res.status(200).json({ msg: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: "An error occurred during logout" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const idToDelete = req.params.id;
  const requestingUserId = req.userId;

  if (requestingUserId != idToDelete) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await DB("tasks")
      .whereIn("todoId", function () {
        this.select("id").from("todos").where("userId", idToDelete);
      })
      .delete();
    await DB("todos").where({ userId: idToDelete }).delete();
    const result = await DB("users").where({ id: idToDelete }).delete();

    if (result != 0) {
      res.status(200).json({ msg: `User with id ${idToDelete} deleted` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
