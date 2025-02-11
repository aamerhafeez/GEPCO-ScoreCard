const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" })); // Allow all connections

// -------------------------------------
// ✅ Database Connection (Using Connection Pool)
// -------------------------------------
const db = mysql.createPool({
    host: "82.197.82.61", // Replace with actual database host
    user: "u130364636_amer", // Replace with actual username
    password: "jZ~dox[oZ3", // Replace with actual password
    database: "u130364636_kpi", // Use the created database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("✅ MySQL Pool is Ready for Queries");

// -------------------------------------
// ✅ Test API
// -------------------------------------
app.get("/test", (req, res) => res.json({ message: "API is working!" }));

// -------------------------------------
// ✅ USER MANAGEMENT
// -------------------------------------

// Fetch all users
app.get("/users", async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM users");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new user
app.post("/users", async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        const [result] = await db.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role]
        );
        res.json({ message: "User added successfully!", userId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user
app.put("/users/:id", async (req, res) => {
    const { name, email, role } = req.body;
    try {
        await db.execute("UPDATE users SET name=?, email=?, role=? WHERE user_id=?", [
            name, email, role, req.params.id
        ]);
        res.json({ message: "User updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
    try {
        await db.execute("DELETE FROM users WHERE user_id=?", [req.params.id]);
        res.json({ message: "User deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------
// ✅ EMPLOYEE TRANSFERS
// -------------------------------------
//fetch office types
app.get("/office-types", async (req, res) => {
    try {
        const [results] = await db.execute("SELECT DISTINCT office_type FROM offices");
        res.json(results.map(row => row.office_type));
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// Fetch all offices
app.get("/offices", async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM offices");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Add a new office
app.post("/add-office", async (req, res) => {
    const { office_name, office_type, parent_office_id } = req.body;
    
    try {
        // ✅ Set parent_office_id to NULL if the office is a Circle
        const parentId = office_type === "Circle" ? null : parent_office_id;

        const [result] = await db.execute(
            "INSERT INTO offices (office_name, office_type, parent_office_id) VALUES (?, ?, ?)",
            [office_name, office_type, parentId]
        );
        
        res.json({ message: "Office added successfully!", office_id: result.insertId });
    } catch (err) {
        // console.error("❌ Error adding office:", err);
        res.status(500).json({ error: err.message });
    }
});


// Delete an office
app.delete("/delete-office/:office_id", async (req, res) => {
    try {
        await db.execute("DELETE FROM offices WHERE office_id=?", [req.params.office_id]);
        res.json({ message: "Office deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Fetch all employees
app.get("/employees", async (req, res) => {
    try {
        const [results] = await db.execute(`
            SELECT e.employee_id, e.name, e.role, o.office_name, o.office_type, o.office_id
            FROM employees e
            JOIN offices o ON e.office_id = o.office_id
        `);
        res.json(results);
    } catch (err) {
        // console.error("❌ Error fetching employees:", err);
        res.status(500).json({ error: err.message });
    }
});
// Add a new employee
app.post("/add-employee", async (req, res) => {
    const { name, role, office_id } = req.body;
    try {
        const [result] = await db.execute(
            "INSERT INTO employees (name, role, office_id) VALUES (?, ?, ?)",
            [name, role, office_id]
        );
        res.json({ message: "Employee added successfully!", employee_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update employee details
app.put("/update-employee/:employee_id", async (req, res) => {
    const { name, role, office_id } = req.body;
    const { employee_id } = req.params;
    try {
        await db.execute(
            "UPDATE employees SET name=?, role=?, office_id=? WHERE employee_id=?",
            [name, role, office_id, employee_id]
        );
        res.json({ message: "Employee updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an employee
app.delete("/delete-employee/:employee_id", async (req, res) => {
    try {
        await db.execute("DELETE FROM employees WHERE employee_id=?", [req.params.employee_id]);
        res.json({ message: "Employee deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//API to Fetch Employees Based on Office Selection
app.get("/employees-by-office", async (req, res) => {
    const { office_id } = req.query;

    if (!office_id) {
        return res.status(400).json({ error: "Office ID is required" });
    }

    try {
        const sql = `
            SELECT employee_id, name, role, office_id 
            FROM employees 
            WHERE office_id = ?  -- ✅ Ensures only employees for the selected office are fetched
        `;

        const [results] = await db.execute(sql, [office_id]);

        // console.log(`✅ Employees for Office ${office_id}:`, results);
        res.json(results);
    } catch (err) {
        // console.error("🔥 ERROR in /employees-by-office:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});
// Fetch all transfers
app.get("/transfers", async (req, res) => {
    const sql = `
        SELECT t.transfer_id, e.name AS employee, e.employee_id , o1.office_name AS from_office,
               o2.office_name AS to_office, t.reason
        FROM transfers t
        JOIN employees e ON t.employee_id = e.employee_id
        JOIN offices o1 ON t.from_office_id = o1.office_id
        JOIN offices o2 ON t.to_office_id = o2.office_id
        ORDER BY t.transfer_date DESC;
    `;
    try {
        const [results] = await db.execute(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a transfer
app.post("/transfers", async (req, res) => {
    const { employee_id, from_office_id, to_office_id, reason } = req.body;

    if (!employee_id || !from_office_id || !to_office_id || !reason) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Insert transfer record
        const [result] = await connection.execute(
            "INSERT INTO transfers (employee_id, from_office_id, to_office_id, reason, transfer_date) VALUES (?, ?, ?, ?, NOW())",
            [employee_id, from_office_id, to_office_id, reason]
        );

        // Update employee's office_id to reflect new office
        await connection.execute(
            "UPDATE employees SET office_id = ? WHERE employee_id = ?",
            [to_office_id, employee_id]
        );

        await connection.commit();
        res.status(201).json({ message: "Transfer recorded successfully", transfer_id: result.insertId });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        connection.release();
    }
});



// -------------------------------------
// ✅ KPI MANAGEMENT
// -------------------------------------

// Fetch KPI targets
app.get("/kpi-data", async (req, res) => {
    try {
        const [results] = await db.execute("SELECT user_id, target, achievement, month FROM kpi_targets");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a KPI target
app.post("/add-kpi", async (req, res) => {
    const { user_id, target, achievement, month } = req.body;
    try {
        const [result] = await db.execute(
            "INSERT INTO kpi_targets (user_id, target, achievement, month) VALUES (?, ?, ?, ?)",
            [user_id, target, achievement, month]
        );
        res.json({ message: "KPI data added successfully!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -------------------------------------
// ✅ PENDING ACHIEVEMENTS API
// -------------------------------------

app.get("/pending-achievements", async (req, res) => {
    const sql = `
        SELECT t.target_id, t.user_id, t.month, t.target_value,
               IFNULL(a.achieved_value, 0) AS achieved_value
        FROM targets t
        LEFT JOIN achievements a ON t.target_id = a.target_id
        WHERE a.achieved_value IS NULL OR a.achieved_value < t.target_value;
    `;

    try {
        const [results] = await db.execute(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});
// -------------------------------------
// ✅ AUTHENTICATION (JWT Login)
// -------------------------------------

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [results] = await db.execute(sql, [email]);

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // console.log("🛠 DEBUG: Sending user_id:", user.user_id); // ✅ Debug log

        // ✅ Ensure `user_id` is included in the response
        res.json({
            message: "Login successful!",
            token,
            role: user.role,
            user_id: user.user_id, // ✅ FIXED: Now sending user_id
        });

    } catch (err) {
        // console.error("🔥 ERROR in /login:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// ✅ API: Get all Target Heads
app.get("/target-heads", async (req, res) => {
    try {
        const sql = `SELECT id, head FROM targetheads`;
        const [results] = await db.execute(sql);

        if (results.length === 0) {
            return res.status(404).json({ error: "No target heads found." });
        }

        //.log("✅ Target Heads Fetched:", results);
        res.json(results);
    } catch (econsolerr) {
        // console.error("🔥 ERROR in /target-heads:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});
// ✅ API: Add a New Target Head
app.post("/add-targethead", async (req, res) => {
    const { head } = req.body;
    if (!head) return res.status(400).json({ error: "Target head name is required" });

    try {
        const [result] = await db.execute("INSERT INTO targetheads (head) VALUES (?)", [head]);
        res.json({ message: "Target Head added successfully!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});
// ✅ API: Delete a Target Head
app.post("/delete-targethead", async (req, res) => {
    const { id } = req.body; // Ensure we send the ID instead of head
    if (!id) return res.status(400).json({ error: "Target head ID is required" });

    try {
        const [result] = await db.execute("DELETE FROM targetheads WHERE id = ?", [id]);
        res.json({ message: "Target Head deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});
// ✅ API: Get All Targets (with target head names)
app.get("/targets", async (req, res) => {
    try {
        const { employee_id } = req.query;
        let sql = `
            SELECT 
    t.target_id, 
    e.name AS officer_name,  
    o.office_name, 
    th.head AS target_head_name, 
    DATE_FORMAT(t.month, '%Y-%m') AS formatted_month,  
    t.target_value, 
    t.achieved_value,
    t.employee_id
FROM targets t
JOIN employees e ON t.employee_id = e.employee_id  
JOIN offices o ON t.office_id = o.office_id  -- Fix: Joining employees with offices instead of targets
LEFT JOIN targetheads th ON t.target_head_id = th.id

        `;

        let params = [];
        if (employee_id) {
            sql += " WHERE t.employee_id = ?";
            params.push(employee_id);
        }

        const [results] = await db.execute(sql, params);
        res.json(results);
    } catch (err) {
        // console.error("🔥 ERROR in /targets:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

//API to Fetch Targets Based on Office Selection
app.get("/targets-by-office", async (req, res) => {
    const { office_id } = req.query;

    if (!office_id) {
        return res.status(400).json({ error: "Office ID is required" });
    }

    const sql = `
        SELECT 
            t.target_id, 
            e.name AS employee_name, 
            o.office_name, 
            th.head AS target_head_name, 
            DATE_FORMAT(t.month, '%Y-%m') AS formatted_month,
            t.target_value, 
            t.achieved_value
        FROM targets t
        JOIN employees e ON t.employee_id = e.employee_id
        JOIN offices o ON t.office_id = o.office_id
        JOIN targetheads th ON t.target_head_id = th.id
        WHERE t.office_id = ? 
            OR t.employee_id IN (
                SELECT employee_id FROM transfers 
                WHERE to_office_id = ? OR from_office_id = ?
            )
        ORDER BY t.month DESC;
    `;

    try {
        const [results] = await db.execute(sql, [office_id, office_id, office_id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});


// ✅ API: Add a New Target (Check for Errors)
app.post("/add-target", async (req, res) => {
    const { employee_id, office_id, target_name, target_value, month, assigned_by, target_head_id } = req.body;

    // 🛑 Validate Input
    if (!employee_id || !office_id || !target_name || !target_value || !month) {
        return res.status(400).json({ error: "Missing required fields: employee_id, office_id, target_name, target_value, month" });
    }

    try {
        // console.log("📅 Received Month in Backend:", month); // Debugging

        const [result] = await db.execute(
            "INSERT INTO targets (employee_id, office_id, target_name, target_value, month, assigned_by, target_head_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [parseInt(employee_id), parseInt(office_id), target_name, parseInt(target_value), month, assigned_by, target_head_id]
        );

        // console.log("✅ Target added successfully, Insert ID:", result.insertId);
        res.json({ message: "Target added successfully!", target_id: result.insertId });
    } catch (err) {
        // console.error("❌ Database Error:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// ✅ API: Delete a Target
app.delete("/delete-target/:target_id", async (req, res) => {
    const { target_id } = req.params;
    try {
        await db.execute("DELETE FROM targets WHERE target_id = ?", [target_id]);
        res.json({ message: "Target deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// ✅ API: Update Target Value
app.put("/update-target/:target_id", async (req, res) => {
    const { target_id } = req.params;
    const { target_value } = req.body;

    if (!target_value) return res.status(400).json({ error: "Target value is required" });

    try {
        await db.execute("UPDATE targets SET target_value = ? WHERE target_id = ?", [target_value, target_id]);
        res.json({ message: "Target updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});
//To record an achievement for an assigned target
app.post("/add-achievement", async (req, res) => {
    const { target_id, achieved_value } = req.body;

    if (!target_id || achieved_value === undefined) {
        return res.status(400).json({ error: "Target ID and achieved value are required." });
    }

    try {
        // Check if achievement already exists for the target
        const [existing] = await db.execute("SELECT * FROM targets WHERE target_id = ?", [target_id]);

        if (existing.length > 0) {
            // Update existing achievement
            await db.execute(
                "UPDATE targets SET achieved_value = ? WHERE target_id = ?",
                [achieved_value, target_id]
            );
        } else {
            // Insert new achievement
            await db.execute(
                "INSERT INTO targets (target_id, achieved_value) VALUES (?, ?)",
                [target_id, achieved_value]
            );
        }

        res.json({ message: "Achievement recorded successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// Officer report
app.get("/officer-report/:user_id", async (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT 
            DATE_FORMAT(t.month, '%m-%Y') AS formatted_month,
            t.target_value,
            IFNULL(a.achieved_value, 0) AS achieved_value
        FROM targets t
        LEFT JOIN achievements a ON t.target_id = a.target_id
        WHERE t.user_id = ?
        ORDER BY t.month ASC;
    `;

    try {
        const [results] = await db.execute(sql, [user_id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

app.get("/report-data", async (req, res) => {
    const sql = `
        SELECT t.month, u.role, SUM(t.target_value) AS target_value, SUM(a.achieved_value) AS achieved_value
        FROM targets t
        JOIN users u ON t.user_id = u.user_id
        LEFT JOIN achievements a ON t.target_id = a.target_id
        GROUP BY t.month, u.role
        ORDER BY t.month ASC;
    `;
    try {
        const [results] = await db.execute(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});
// Get Offices Hierarchy
app.get("/offices-hierarchy", async (req, res) => {
    try {
        const [results] = await db.execute(`
            SELECT 
    o.office_id, 
    o.office_name, 
    o.office_type, 
    o.parent_office_id, 

    -- Get Circle Name
       (SELECT o1.office_name FROM offices o1 WHERE o1.office_id = 
         (SELECT o2.parent_office_id FROM offices o2 WHERE o2.office_id = 
            (CASE 
                WHEN o.office_type = 'Sub-Division' THEN o.parent_office_id
                WHEN o.office_type = 'Division' THEN o.office_id
                ELSE NULL
            END)
        )
       ) AS circle_name,

    -- Get Division Name
       (SELECT o2.office_name FROM offices o2 WHERE o2.office_id = 
        (CASE 
            WHEN o.office_type = 'Sub-Division' THEN o.parent_office_id
            WHEN o.office_type = 'Division' THEN o.office_id
            ELSE NULL
        END)
       ) AS division_name,

    -- Get Sub-Division Name
        (CASE 
          WHEN o.office_type = 'Sub-Division' THEN o.office_name 
          ELSE NULL 
          END) AS subdivision_name

          FROM offices o
          ORDER BY o.office_type, o.office_name;

        `);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// -------------------------------------
// ✅ START SERVER
// -------------------------------------

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
