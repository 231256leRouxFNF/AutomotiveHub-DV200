const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

const followController = {
  followUser: (req, res) => {
    const followerId = req.userId; // Assuming followerId is set by auth middleware
    const { followeeId } = req.body;

    if (!followerId || !followeeId) {
      return res.status(400).json({ message: 'Follower ID and Followee ID are required.' });
    }

    if (followerId === followeeId) {
      return res.status(400).json({ message: 'Users cannot follow themselves.' });
    }

    Follow.isFollowing(followerId, followeeId, (err, isFollowing) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking follow status.', error: err });
      }
      if (isFollowing) {
        return res.status(409).json({ message: 'Already following this user.' });
      }

      Follow.create(followerId, followeeId, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error following user.', error: err });
        }

        // Create a notification for the followee
        // You'll need to fetch the follower's username here for a good message
        // For simplicity, let's assume we can get it from req.user or a quick DB lookup
        // For now, using a placeholder, ideally fetch username:
        const followerUsername = req.user?.username || `User ${followerId}`;
        const notificationData = {
          userId: followeeId,
          type: 'new_follower',
          message: `@${followerUsername} started following you.`,
          link: `/profile/${followerId}`,
          isRead: 0,
        };
        Notification.create(notificationData, (notifErr) => {
          if (notifErr) {
            console.error('Error creating new follower notification:', notifErr);
          }
        });

        res.status(201).json({ message: 'User followed successfully.', followId: result });
      });
    });
  },

  unfollowUser: (req, res) => {
    const followerId = req.userId; // Assuming followerId is set by auth middleware
    const { followeeId } = req.body;

    if (!followerId || !followeeId) {
      return res.status(400).json({ message: 'Follower ID and Followee ID are required.' });
    }

    Follow.delete(followerId, followeeId, (err, success) => {
      if (err) {
        return res.status(500).json({ message: 'Error unfollowing user.', error: err });
      }
      if (!success) {
        return res.status(404).json({ message: 'Follow relationship not found.' });
      }
      res.json({ message: 'User unfollowed successfully.' });
    });
  },

  getFollowers: (req, res) => {
    const userId = req.params.id;
    Follow.getFollowers(userId, (err, followers) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching followers.', error: err });
      }
      res.json(followers);
    });
  },

  getFollowing: (req, res) => {
    const userId = req.params.id;
    Follow.getFollowing(userId, (err, following) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching following.', error: err });
      }
      res.json(following);
    });
  },

  getFollowStatus: (req, res) => {
    const followerId = req.userId; // Assuming current user is the follower
    const followeeId = req.params.id; // User whose follow status we want to check

    if (!followerId || !followeeId) {
      return res.status(400).json({ message: 'Follower ID and Followee ID are required.' });
    }

    Follow.isFollowing(followerId, followeeId, (err, isFollowing) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking follow status.', error: err });
      }
      res.json({ isFollowing });
    });
  },
};

module.exports = followController;
