const express = require('express');
const router = express.Router();
const StaffAccess = require('../models/StaffAccess.js');
const auth = require('../middleware/auth.js');

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Only administrators can manage staff access.'
        });
    }
    next();
};

// Request staff access
router.post('/request', auth, async (req, res) => {
    try {
        const { role, specialization, department } = req.body;

        // Check if request already exists
        let staffAccess = await StaffAccess.findOne({ staff: req.user._id });
        if (staffAccess) {
            return res.status(400).json({
                success: false,
                message: 'Access request already exists'
            });
        }

        // Create new access request
        staffAccess = new StaffAccess({
            staff: req.user._id,
            role,
            specialization,
            department
        });

        await staffAccess.save();

        res.json({
            success: true,
            message: 'Access request submitted successfully',
            data: staffAccess
        });
    } catch (error) {
        console.error('Error requesting staff access:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting access request'
        });
    }
});

// Get all staff access requests (admin only)
router.get('/requests', auth, checkAdmin, async (req, res) => {
    try {
        const requests = await StaffAccess.find()
            .populate('staff', 'name email')
            .populate('approvedBy', 'name email');

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching staff access requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching access requests'
        });
    }
});

// Approve staff access (admin only)
router.post('/approve/:staffId', auth, checkAdmin, async (req, res) => {
    try {
        const staffAccess = await StaffAccess.findOne({ staff: req.params.staffId });
        
        if (!staffAccess) {
            return res.status(404).json({
                success: false,
                message: 'Access request not found'
            });
        }

        await staffAccess.approve(req.user._id);

        res.json({
            success: true,
            message: 'Staff access approved successfully',
            data: staffAccess
        });
    } catch (error) {
        console.error('Error approving staff access:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving staff access'
        });
    }
});

// Reject staff access (admin only)
router.post('/reject/:staffId', auth, checkAdmin, async (req, res) => {
    try {
        const staffAccess = await StaffAccess.findOne({ staff: req.params.staffId });
        
        if (!staffAccess) {
            return res.status(404).json({
                success: false,
                message: 'Access request not found'
            });
        }

        await staffAccess.reject(req.user._id);

        res.json({
            success: true,
            message: 'Staff access rejected successfully',
            data: staffAccess
        });
    } catch (error) {
        console.error('Error rejecting staff access:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting staff access'
        });
    }
});

// Check staff access status
router.get('/status', auth, async (req, res) => {
    try {
        const staffAccess = await StaffAccess.findOne({ staff: req.user._id })
            .populate('approvedBy', 'name email');

        if (!staffAccess) {
            return res.status(404).json({
                success: false,
                message: 'No access request found'
            });
        }

        res.json({
            success: true,
            data: staffAccess
        });
    } catch (error) {
        console.error('Error checking staff access status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking access status'
        });
    }
});

module.exports = router; 