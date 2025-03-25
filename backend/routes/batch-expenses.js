const express = require("express");
const connection = require("../config/dbConnection");
const router = express.Router();
router.use(express.json());

// Save expenses to the database
router.post("/", (request, response) => {
  const { type, cost, date, sellerId } = request.body;
  const query =
    "INSERT INTO batch_expenses (Type, Price, Date, seller_id) VALUES (?, ?, ?, ?)";

  connection.query(query, [type, cost, date, sellerId], (err, results) => {
    if (err) {
      console.error("Error saving expense:", err);
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json({ message: "Expense Saved Successfully" });
  });
});

// Delete expenses from the database
router.delete("/:id", (request, response) => {
  const { id } = request.params;
  const query = "DELETE FROM batch_expenses WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    return response
      .status(200)
      .json({ message: "Expense Deleted Successfully" });
  });
});

// Retrieve expenses from the database
router.get("/", (request, response) => {
  const query = "SELECT * FROM batch_expenses ORDER BY Date DESC";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json(results);
  });
});
//retrieve expenses by sellerid
router.get("/:id", (request, response) => {
  const { id } = request.params;
  const query = "SELECT * FROM batch_expenses WHERE seller_id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json(results);
  });
});

//modify expenses
router.put("/:id", (request, response) => {
  const { id } = request.params;
  const { type, cost, date, sellerId } = request.body;

  const query =
    "UPDATE batch_expenses SET Type = ?, Price = ?, Date = ? seller_id = ? WHERE id = ?";

  connection.query(query, [type, cost, date, sellerId, id], (err, result) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Expense not found" });
    }
    return response
      .status(200)
      .json({ message: "Expense Updated Successfully" });
  });
});

module.exports = router;
