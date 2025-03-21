const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const auth = require('../middleware/auth.js');


router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});


router.post('/register', async (req, res) => {
    try { 
        console.log('Registration attempt:', req.body);
        const { name, email, password, role, hospital } = req.body;


        if (!name || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format');
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        
        if (password.length < 6) {
            console.log('Password too short');
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        
        if (!['patient', 'medical_staff', 'admin'].includes(role)) {
            console.log('Invalid role:', role);
            return res.status(400).json({ message: 'Invalid role' });
        }

        
        if (role === 'admin') {
            
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.status(403).json({ message: 'Admin already exists' });
            }
        }

        
        if (role === 'medical_staff') {
            if (!hospital || !hospital.name || !hospital.address || !hospital.department || 
                !hospital.position || !hospital.staffId || !hospital.contact) {
                console.log('Missing hospital information:', hospital);
                return res.status(400).json({ message: 'Please provide all hospital information' });
            }
        }
        
        
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Creating new user...');
        
        const userData = {
            name,
            email,
            password,
            role
        };


        if (role === 'medical_staff') {
            userData.hospital = {
                name: hospital.name,
                address: hospital.address,
                department: hospital.department,
                position: hospital.position,
                staffId: hospital.staffId,
                contact: hospital.contact
            };
        }

        
        if (role === 'admin') {
            userData.isVerified = true;
        }

        user = new User(userData);
        await user.save();
        console.log('User created successfully:', user._id);

        
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        };

        
        if (role === 'medical_staff') {
            userResponse.hospital = user.hospital;
        }

        res.status(201).json({
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Error creating user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt:', { email: req.body.email, role: req.body.role });
        const { email, password } = req.body;

        
        if (!email || !password) {
            console.log('Missing login credentials');
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        };

        
        if (user.role === 'medical_staff') {
            userResponse.hospital = user.hospital;
        }

        console.log('Login successful for user:', email, 'Role:', user.role);
        res.json({
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Error logging in',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};


router.get('/unverified-staff', auth, isAdmin, async (req, res) => {
    try {
        const unverifiedStaff = await User.find({
            role: 'medical_staff',
            isVerified: false
        }).select('-password');
        res.json(unverifiedStaff);
    } catch (error) {
        console.error('Error fetching unverified staff:', error);
        res.status(500).json({ message: 'Error fetching unverified staff' });
    }
});


router.post('/verify-staff/:userId', auth, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role !== 'medical_staff') {
            return res.status(400).json({ message: 'User is not medical staff' });
        }
        
        user.isVerified = true;
        await user.save();
        
        res.json({ message: 'Staff member verified successfully', user });
    } catch (error) {
        console.error('Error verifying staff:', error);
        res.status(500).json({ message: 'Error verifying staff member' });
    }
});


router.post('/revoke-staff/:userId', auth, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role !== 'medical_staff') {
            return res.status(400).json({ message: 'User is not medical staff' });
        }
        
        user.isVerified = false;
        await user.save();
        
        res.json({ message: 'Staff verification revoked successfully', user });
    } catch (error) {
        console.error('Error revoking staff verification:', error);
        res.status(500).json({ message: 'Error revoking staff verification' });
    }
});


router.get('/all-staff', auth, isAdmin, async (req, res) => {
    try {
        const allStaff = await User.find({
            role: 'medical_staff'
        }).select('-password').sort({ createdAt: -1 });
        res.json(allStaff);
    } catch (error) {
        console.error('Error fetching all staff:', error);
        res.status(500).json({ message: 'Error fetching staff members' });
    }
});

module.exports = router; 