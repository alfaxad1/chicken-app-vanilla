const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authenticateToken = require("../middlewares/auth");
const validate = require("../models/registerModel");
const connection = require("../config/dbConnection");
const router = express.Router();
router.use(express.json());
require("dotenv").config();

const salt = 10;

//get all users
router.get("/", (req, res) => {
  const sql = "SELECT * FROM users";
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "error getting users" });
    res.status(200).json(result);
  });
});

//delete a user
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error deleting user" });
    res.status(200).json({ message: "User deleted successfully" });
  });
});

//register a user
router.post("/register", validate, (req, res) => {
  const sql = "INSERT INTO users (username, password, role) VALUES (?)";
  bcrypt.hash(req.body.password, salt, (err, hash) => {
    if (err) return res.status(500).json({ error: "error hashing password" });
    const values = [req.body.username, hash, req.body.role];
    connection.query(sql, [values], (err, result) => {
      if (err) return res.status(500).json({ error: "error registering user" });
      res
        .status(200)
        .json({ message: "User registered successfully", Status: "Success" });
    });
  });
});

//login a user
router.post("/login", (req, res) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  connection.query(sql, [req.body.username], (err, result) => {
    if (err) return res.json({ error: "Error logging in" });
    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err) return res.json({ error: "password does not match" });
        if (response) {
          const user = result[0];
          const id = result[0].id;
          const username = result[0].username;
          const role = result[0].role;
          const secret = process.env.JWT_SECRET;
          const token = jwt.sign({ id }, secret, {
            expiresIn: "1h",
          });

          res.cookie("token", token, { httpOnly: true });

          return res.json({ token, user });
        } else {
          res.json({ error: "Incorect password" });
        }
      });
    } else {
      res.json({ error: "User not found" });
    }
  });
});

module.exports = router;
