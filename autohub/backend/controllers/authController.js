// Logout function
exports.logout = (req, res) => {
  try {
    
    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error logging out',
      error: error.message 
    });
  }
};