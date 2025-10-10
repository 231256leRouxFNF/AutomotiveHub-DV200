const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
// const auth = require('../middleware/auth'); // Assuming you have an auth middleware

// Follow a user
router.post('/follow', followController.followUser);

// Unfollow a user
router.post('/unfollow', followController.unfollowUser);

// Get followers of a user
router.get('/:id/followers', followController.getFollowers);

// Get users followed by a user
router.get('/:id/following', followController.getFollowing);

// Get follow status between two users
router.get('/:id/status', followController.getFollowStatus);

module.exports = router;
