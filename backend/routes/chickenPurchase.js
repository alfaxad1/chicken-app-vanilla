const express = require("express");
const connection = require("../config/dbConnection");
const router = express.Router();
router.use(express.json());

// Get all chicken purchases
router.get("/", (req, res) => {
  const query = "SELECT * FROM chicken_purchases";
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Create a chicken purchase
router.post("/", (req, res) => {
  const { supplierId, chickenType, price, pieces, total, date } = req.body;
  const query =
    "INSERT INTO chicken_purchases (supplier_id, chicken_type, price_per_piece, no_of_pieces, total_price, purchase_date) VALUES (?, ?, ?, ?, ?, ?)";
  connection.query(
    query,
    [supplierId, chickenType, price, pieces, total, date],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json({ message: "Purchase added successfully" });
    }
  );
});

// Update a chicken purchase
router.put("/:id", (req, res) => {
  const { supplierId, chickenType, price, pieces, total, date } = req.body;
  const query =
    "UPDATE chicken_purchases SET supplier_id = ?, chicken_type = ?, price_per_piece = ?, no_of_pieces = ?, total_price = ?, purchase_date = ? WHERE id = ?";
  connection.query(
    query,
    [supplierId, chickenType, price, pieces, total, date, req.params.id],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "Purchase updated successfully" });
    }
  );
});

// Delete a chicken purchase
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM chicken_purchases WHERE id = ?";
  connection.query(query, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json({ message: "Purchase deleted successfully" });
  });
});

module.exports = router;
