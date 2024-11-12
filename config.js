const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chicken_project",
});

connection.connect((error) => {
  if (error) throw error;
  console.log("connected to MySQL");
});

// Retrieve purchases from the database
app.get("/api/purchases", (request, response) => {
  const query = "SELECT * FROM purchases";
  connection.query(query, (err, results) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json(results);
  });
});

// Save purchases to the database
app.post("/api/purchases", (request, response) => {
  const { product, qty, price, date } = request.body;
  const query =
    "INSERT INTO purchases (product_name, quantity, price, purchase_date) VALUES (?, ?, ?, ?)";
  connection.query(query, [product, qty, price, date], (err, results) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    return response
      .status(200)
      .json({ message: "Purchase Saved Successfully" });
  });
});

// Save expenses to the database
app.post("/api/expenses", (request, response) => {
  const { type, cost, date } = request.body;
  const query = "INSERT INTO expenses (Type, Price, Date) VALUES (?, ?, ?)";

  connection.query(query, [type, cost, date], (err, results) => {
    if (err) {
      console.error("Error saving expense:", err);
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json({ message: "Expense Saved Successfully" });
  });
});

// Delete expenses from the database
app.delete("/api/expenses/:id", (request, response) => {
  const { id } = request.params;
  const query = "DELETE FROM expenses WHERE id = ?";

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
app.get("/api/expenses", (request, response) => {
  const query = "SELECT * FROM expenses ORDER BY Date DESC";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      return response.status(500).json({ error: err.message });
    }
    return response.status(200).json(results);
  });
});

app.get("/api/profits", (req, res) => {
  const query = `
      SELECT
          all_months.month,
          COALESCE(purchases.total_purchases, 0) AS total_purchases,
          COALESCE(expenses.total_expenses, 0) AS total_expenses,
          COALESCE(sales.total_sales, 0) AS total_sales,
          (COALESCE(sales.total_sales, 0) - (COALESCE(purchases.total_purchases, 0) + COALESCE(expenses.total_expenses, 0))) AS profit
      FROM
          (
              SELECT DISTINCT DATE_FORMAT(purchase_date, '%Y-%m') AS month FROM purchases
              UNION
              SELECT DISTINCT DATE_FORMAT(Date, '%Y-%m') AS month FROM expenses
              UNION
              SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') AS month FROM sales
          ) AS all_months
      LEFT JOIN
          (
              SELECT 
                  DATE_FORMAT(purchase_date, '%Y-%m') AS month, 
                  SUM(price) AS total_purchases
              FROM purchases
              GROUP BY DATE_FORMAT(purchase_date, '%Y-%m')
          ) AS purchases
      ON all_months.month = purchases.month
      LEFT JOIN
          (
              SELECT 
                  DATE_FORMAT(Date, '%Y-%m') AS month, 
                  SUM(Price) AS total_expenses
              FROM expenses
              GROUP BY DATE_FORMAT(Date, '%Y-%m')
          ) AS expenses
      ON all_months.month = expenses.month
      LEFT JOIN
          (
              SELECT 
                  DATE_FORMAT(date, '%Y-%m') AS month, 
                  SUM(total_price) AS total_sales
              FROM sales
              GROUP BY DATE_FORMAT(date, '%Y-%m')
          ) AS sales
      ON all_months.month = sales.month
      ORDER BY all_months.month;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Detailed Profit Fetch Error:", {
        message: error.message,
        sql: error.sql,
        sqlState: error.sqlState,
        code: error.code,
      });
      return res.status(500).json({
        message: "Error fetching profits",
        error: error.message,
      });
    }

    // Add some logging to understand the data
    console.log(
      "Profit Calculation Results:",
      JSON.stringify(results, null, 2)
    );

    // Process results to ensure proper formatting
    const processedResults = results.map((result) => ({
      month: result.month,
      total_purchases: parseFloat(result.total_purchases).toFixed(2),
      total_expenses: parseFloat(result.total_expenses).toFixed(2),
      total_sales: parseFloat(result.total_sales).toFixed(2),
      profit: parseFloat(result.profit).toFixed(2),
    }));

    return res.json(processedResults);
  });
});

// Delete purchases from the database
app.delete("/api/purchases/:id", (request, response) => {
  const { id } = request.params;
  const query = "DELETE FROM purchases WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    return response
      .status(200)
      .json({ message: "Purchase Deleted Successfully" });
  });
});
// Update purchases in the database
app.put("/api/purchases/:id", (request, response) => {
  const { id } = request.params;
  const { product_name, quantity, price, purchase_date } = request.body;

  const query =
    "UPDATE purchases SET product_name = ?, quantity = ?, price = ?, purchase_date = ? WHERE id = ?";

  connection.query(
    query,
    [product_name, quantity, price, purchase_date, id],
    (err, result) => {
      if (err) {
        return response.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return response.status(404).json({ message: "Purchase not found" });
      }
      return response
        .status(200)
        .json({ message: "Purchase Updated Successfully" });
    }
  );
});

//modify expenses
app.put("/api/expenses/:id", (request, response) => {
  const { id } = request.params;
  const { type, cost, date } = request.body;

  const query = "UPDATE expenses SET type = ?, cost = ?, date = ? WHERE id = ?";

  connection.query(query, [type, cost, date, id], (err, result) => {
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
app.put("/api/sales/:id", (request, response) => {
  const { id } = request.params;
  const { customer_id, quantity_sold, price, date } = request.body;

  const query =
    "UPDATE sales SET customer_id = ?, quantity_sold = ?, price = ?, date = ? WHERE id = ?";

  connection.query(
    query,
    [customer_id, quantity_sold, price, date, id],
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
// Save sales to the database
app.post("/api/sales", (request, response) => {
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
app.get("/api/sales", (request, response) => {
  const query = "SELECT * FROM sales ORDER BY date DESC";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching sales:", err);
      return response.status(500).json({ error: err.message });
    }
    console.log("Fetched sales:", results); // Add this line
    return response.status(200).json(results);
  });
});

// Delete a sale
app.delete("/api/sales/:id", (request, response) => {
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
// Create a chicken purchase
app.post("/api/chicken-purchases", (req, res) => {
  const { supplierId, chickenType, price, pieces, total, date } = req.body;
  const query =
    "INSERT INTO chicken_purchases (supplier_id, chicken_type, price_per_piece, no_of_pieces, total_price, purchase_date) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [supplierId, chickenType, price, pieces, total, date],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "Purchase added successfully" });
    }
  );
});

// Get all chicken purchases
app.get("/api/chicken-purchases", (req, res) => {
  const query = "SELECT * FROM chicken_purchases";
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Update a chicken purchase
app.put("/api/chicken-purchases/:id", (req, res) => {
  const { supplierId, chickenType, price, pieces, total, date } = req.body;
  const query =
    "UPDATE chicken_purchases SET supplier_id = ?, chicken_type = ?, price_per_piece = ?, no_of_pieces = ?, total_price = ?, purchase_date = ? WHERE id = ?";
  db.query(
    query,
    [supplierId, chickenType, price, pieces, total, date, req.params.id],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "Purchase updated successfully" });
    }
  );
});

// Delete a chicken purchase
app.delete("/api/chicken-purchases/:id", (req, res) => {
  const query = "DELETE FROM chicken_purchases WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json({ message: "Purchase deleted successfully" });
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Username", username);
  console.log("password", password);
  const sql = "SELECT * FROM users WHERE user_name = ? AND password = ?";
  const [row] = db.query(sql, username, password);
  if (row.length === 0) {
    return res.json({ message: "Invalid phone number" });
  } else {
    return res.status(200).json({ message: "Login succes" });
  }
});

// Save egg collection
app.post("/api/egg-collection", (req, res) => {
  const { collection_date, eggs_collected, damaged_eggs } = req.body;
  const query =
    "INSERT INTO egg_collection (collection_date, eggs_collected, damaged_eggs) VALUES (?, ?, ?)";

  connection.query(
    query,
    [collection_date, eggs_collected, damaged_eggs],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res
        .status(200)
        .json({ message: "Collection recorded successfully" });
    }
  );
});

// Get all egg collections
app.get("/api/egg-collection", (req, res) => {
  const query = "SELECT * FROM egg_collection ORDER BY collection_date DESC";

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(results);
  });
});

// Get current month's egg collections
app.get("/api/egg-collection/monthly", (req, res) => {
  const query = `
      SELECT collection_date, eggs_collected 
      FROM egg_collection 
      WHERE MONTH(collection_date) = MONTH(CURRENT_DATE()) 
      AND YEAR(collection_date) = YEAR(CURRENT_DATE())
      ORDER BY collection_date ASC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(results);
  });
});

// Delete egg collection
app.delete("/api/egg-collection/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM egg_collection WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Collection deleted successfully" });
  });
});

// app.listen(3000, () => {
//   console.log("Server started on port 3000");
// });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
