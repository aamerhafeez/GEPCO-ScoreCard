const bcrypt = require("bcryptjs");

const password = "admin@gepco";
const hashedPassword = bcrypt.hashSync(password, 10);

console.log("Hashed Password:", hashedPassword);
