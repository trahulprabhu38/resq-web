const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const auth = async (req, res, next) => {
    try {
        console.log('=== Auth Middleware ===');
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            console.error('No Authorization header found');
            return res.status(401).json({ message: 'No authorization token provided' });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Token received:', token.substring(0, 10) + '...');

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token decoded:', { userId: decoded.userId });

        const user = await User.findOne({ _id: decoded.userId });
        console.log('User found:', !!user);

        if (!user) {
            console.error('No user found with decoded ID:', decoded.userId);
            throw new Error('User not found');
        }

        console.log('Auth successful for user:', {
            id: user._id,
            email: user.email,
            role: user.role
        });

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('=== Auth Error ===');
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth; 