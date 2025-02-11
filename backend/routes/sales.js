const express = require("express");
const connection = require("../config/dbConnection");
const router = express.Router();
router.use(express.json());

// Save sales to the database
router.post("/", (request, response) => {
  const {
    customer_id,
    sale_type,
    chicken_type,
    price_per_piece,
    number_of_pieces,
    quantity_sold,
    price_per_unit,
    total_price,
    date,
  } = request.body;

  let query;
  let values;

  if (sale_type === "chicken") {
    query = `INSERT INTO sales 
                (customer_id, sale_type, chicken_type, price_per_piece, 
                number_of_pieces, total_price, date) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
    values = [
      customer_id,
      sale_type,
      chicken_type,
      price_per_piece,
      number_of_pieces,
      total_price,
      date,
    ];
  } else {
    query = `INSERT INTO sales 
                (customer_id, sale_type, quantity_sold, price_per_unit, 
                total_price, date) 
                VALUES (?, ?, ?, ?, ?, ?)`;
    values = [
      customer_id,
      "eggs",
      quantity_sold,
      price_per_unit,
      total_price,
      date,
    ];
  }

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error saving sale:", err);
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json({
      message: "Sale Saved Successfully",
      id: results.insertId,
    });
  });
});

// Get all sales
router.get("/", (request, response) => {
  const query = "SELECT * FROM sales ORDER BY date DESC";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching sales:", err);
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json(results);
  });
});

router.put("/:id", (request, response) => {
  const { id } = request.params;
  const { saleDate, customerId, saleType, quantity, pricePerUnit, totalPrice } =
    request.body;

  const query =
    "UPDATE sales SET date = ?, customer_id = ?, sale_type = ?, quantity_sold = ?, price_per_unit = ?, total_price = ? WHERE id = ?";

  connection.query(
    query,
    [saleDate, customerId, saleType, quantity, pricePerUnit, totalPrice, id],
    (err, result) => {
      if (err) {
        return response.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return response.status(404).json({ message: "Sale not found" });
      }
      return response
        .status(200)
        .json({ message: "Sale Updated Successfully" });
    }
  );
});

// Delete a sale
router.delete("/:id", (request, response) => {
  const { id } = request.params;
  const query = "DELETE FROM sales WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting sale:", err);
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json({ message: "Sale Deleted Successfully" });
  });
});

module.exports = router;
