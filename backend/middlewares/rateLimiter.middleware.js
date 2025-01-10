const {rateLimit} = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: 'You have exceeded the limit of requests. Please try again later.', 
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {rateLimiter};