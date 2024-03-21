const express = require('express');

const { BakRequest, User, BakHasTakenRequest, EventLog } = require('../models');
const { isAuthenticated } = require('../utils/isAuthenticated');

const router = express.Router();




router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'bak', 'profilePicture'],
            include: [
                {
                    model: BakRequest,
                    as: 'BakRequests',
                    where: { status: 'pending' },
                    required: false
                },
                {
                    model: BakHasTakenRequest,
                    as: 'ReceivedProposals',
                    where: { status: 'pending' },
                    required: false
                }
            ]
        });


        // Render the dashboard view with the fetched data
        res.render('dashboard', { user: req.user, users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




router.get('/eventLogs', isAuthenticated, async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1; // Default to first page
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 logs per page
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await EventLog.findAndCountAll({
            include: [{
                model: User,
                as: 'User',
                attributes: ['id', 'name']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
        const totalPages = Math.ceil(count / limit);

        res.render('eventLogs', {
            user: req.user,
            eventLogs: rows,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error('Error fetching event logs:', error);
        res.status(500).send('Error fetching event logs');
    }
});






module.exports = router;
