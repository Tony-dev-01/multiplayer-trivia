"use strict";

require("dotenv").config();
const MONGO_URI = process.env["MONGO_URI"]

module.exports = {
    PORT: process.env.PORT || 4000,
    clientPort : process.env.PORT || 5173,
    database: {
        options: {
            
        },
        MONGO_URI
    }
};