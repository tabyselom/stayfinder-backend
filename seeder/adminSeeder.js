require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcrypt");

const seedAdmin = async () => {
    try {
        const email = "admin@stayfinder.com";

       
        const hashedPassword = await bcrypt.hash("admin123", 10);

        

       console.log(hashedPassword);
        console.log("Admin created successfully");
        process.exit();

    } catch (error) {
        console.log("Seeder error:", error.message);
        process.exit(1);
    }
};

seedAdmin();