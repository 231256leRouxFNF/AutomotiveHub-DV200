const mockPosts = [
  {
    id: 1,
    user: {
      username: "Motor_Head_Mike",
      profile_image: "https://ui-avatars.com/api/?name=Motor+Head+Mike&background=667eea&color=fff&size=48"
    },
    content: "Just finished installing the new turbos on my Supra! The power delivery is mind-blowing. Can't wait to hit the track next week. What's everyone else working on this weekend?",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80", // Toyota Supra
    likes: 234,
    comments: 42,
    created_at: "2 hours ago"
  },
  {
    id: 2,
    user: {
      username: "Rally_Queen_Mia",
      profile_image: "https://ui-avatars.com/api/?name=Rally+Queen+Mia&background=f56565&color=fff&size=48"
    },
    content: "What a blast at the local autocross event! My Subaru WRX performed flawlessly. Managed to shave off 0.5 seconds from my previous best time! Any tips for improving cornering speed?",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", // Subaru WRX
    likes: 189,
    comments: 31,
    created_at: "5 hours ago"
  },
  {
    id: 3,
    user: {
      username: "Classic_Rides_Ken",
      profile_image: "https://ui-avatars.com/api/?name=Classic+Rides+Ken&background=48bb78&color=fff&size=48"
    },
    content: "Restoring this vintage Ford Mustang Fastback. Found some original parts buried in a junk pile but incredibly rewarding. Any other classic car restorers out there?",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80", // Mustang
    likes: 456,
    comments: 67,
    created_at: "1 day ago"
  },
  {
    id: 4,
    user: {
      username: "EV_Enthusiast_Zoe",
      profile_image: "https://ui-avatars.com/api/?name=EV+Enthusiast+Zoe&background=ed8936&color=fff&size=48"
    },
    content: "Just picked up my new electric sports car! The instant torque is INSANE. Excited to join the EV community here on AutoHub. Any charging tips for long-road trips?",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80", // Electric sports car
    likes: 312,
    comments: 28,
    created_at: "1 day ago"
  },
  {
    id: 5,
    user: {
      username: "Drift_King_Hiro",
      profile_image: "https://ui-avatars.com/api/?name=Drift+King+Hiro&background=9f7aea&color=fff&size=48"
    },
    content: "Practicing some tandem drifts with my crew tonight. Nothing better at a runabout! Always learning. Check out the some footage from last session!",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80", // Drifting car
    likes: 521,
    comments: 89,
    created_at: "2 days ago"
  },
  {
    id: 6,
    user: {
      username: "Custom_Paint_Zihle",
      profile_image: "https://ui-avatars.com/api/?name=Custom+Paint+Zihle&background=38b2ac&color=fff&size=48"
    },
    content: "New custom paint job on a client's (Price 267) This metallic flake really pops in the sun. What are your favorite custom paint colors?",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", // Custom painted car
    likes: 678,
    comments: 94,
    created_at: "3 days ago"
  }
];

export default mockPosts;