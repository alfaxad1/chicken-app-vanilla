const express = require("express");
const connection = require("../config/dbConnection");
const router = express.Router();
router.use(express.json());

router.post("/", (req, res) => {
  const { chickenType, cause, number, date } = req.body;
  const query =
    "INSERT INTO chicken_loss (chicken_type, cause, number, date) VALUES (?, ?, ?, ?)";
  connection.query(query, [chickenType, cause, number, date], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "Loss added successfully" });
  });
});

router.get("/", (req, res) => {
  const query = "SELECT * FROM chicken_loss ORDER BY date DESC";
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

router.put("/:id", (req, res) => {
  const { chickenType, cause, number, date } = req.body;
  const { id } = req.params;
  const query =
    "UPDATE chicken_loss SET chicken_type = ?, cause = ?, number = ?, date = ? WHERE id = ?";
  connection.query(
    query,
    [chickenType, cause, number, date, id],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "Loss updated successfully" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM chicken_loss WHERE id = ?`;
  connection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.json({ message: "Deleted successfully" });
  });
});

module.exports = router;
