import React, { useState, useEffect } from 'react';
import { 
  userService, 
  vehicleService, 
  socialService, 
  generalService,
  authService 
} from '../../services/api';

const ApiExample = () => {
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [error, setError] = useState('');

  // Test database connection
  const testConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generalService.testConnection();
      setConnectionStatus(`✅ ${result}`);
    } catch (error) {
      setConnectionStatus('❌ Connection failed');
      setError(error.message || 'Connection failed');
    }
    setLoading(false);
  };

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await userService.getAllUsers();
      setUsers(userData);
      console.log('Users loaded:', userData);
    } catch (error) {
      setError('Failed to load users: ' + (error.message || 'Unknown error'));
    }
    setLoading(false);
  };

  // Load vehicles
  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const vehicleData = await vehicleService.getAllVehicles();
      setVehicles(vehicleData);
      console.log('Vehicles loaded:', vehicleData);
    } catch (error) {
      setError('Failed to load vehicles: ' + (error.message || 'Unknown error'));
    }
    setLoading(false);
  };

  // Load social posts
  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const postData = await socialService.getAllPosts();
      setPosts(postData);
      console.log('Posts loaded:', postData);
    } catch (error) {
      setError('Failed to load posts: ' + (error.message || 'Unknown error'));
    }
    setLoading(false);
  };

  // Test login
  const testLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Try to login with sample user from database
      const result = await authService.login('john_doe', 'password123');
      console.log('Login successful:', result);
      setConnectionStatus('✅ Login successful');
    } catch (error) {
      setError('Login failed: ' + (error.message || 'Unknown error'));
      setConnectionStatus('❌ Login failed');
    }
    setLoading(false);
  };

  // Auto-test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>AutoHub API Connection Test</h1>
      
      {/* Connection Status */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px', 
        backgroundColor: connectionStatus.includes('✅') ? '#d4edda' : '#f8d7da',
        border: `1px solid ${connectionStatus.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '4px'
      }}>
        <strong>Connection Status:</strong> {connectionStatus || 'Testing...'}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: '30px' }}>
        <button onClick={testConnection} disabled={loading} style={{ margin: '5px' }}>
          {loading ? 'Testing...' : 'Test DB Connection'}
        </button>
        <button onClick={testLogin} disabled={loading} style={{ margin: '5px' }}>
          {loading ? 'Testing...' : 'Test Login'}
        </button>
        <button onClick={loadUsers} disabled={loading} style={{ margin: '5px' }}>
          {loading ? 'Loading...' : 'Load Users'}
        </button>
        <button onClick={loadVehicles} disabled={loading} style={{ margin: '5px' }}>
          {loading ? 'Loading...' : 'Load Vehicles'}
        </button>
        <button onClick={loadPosts} disabled={loading} style={{ margin: '5px' }}>
          {loading ? 'Loading...' : 'Load Posts'}
        </button>
      </div>

      {/* Results Display */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Users */}
        {users.length > 0 && (
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3>Users ({users.length})</h3>
            <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #ddd', padding: '10px' }}>
              {users.map(user => (
                <div key={user.id} style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f8f9fa' }}>
                  <strong>{user.username}</strong> ({user.email})
                  <br />
                  <small>Role: {user.role} | Created: {new Date(user.created_at).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicles */}
        {vehicles.length > 0 && (
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3>Vehicles ({vehicles.length})</h3>
            <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #ddd', padding: '10px' }}>
              {vehicles.map(vehicle => (
                <div key={vehicle.id} style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f8f9fa' }}>
                  <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong>
                  <br />
                  <small>Owner: {vehicle.owner_name || vehicle.owner_username} | Color: {vehicle.color}</small>
                  {vehicle.is_featured && <span style={{ color: 'gold' }}> ⭐ Featured</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.length > 0 && (
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3>Social Posts ({posts.length})</h3>
            <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #ddd', padding: '10px' }}>
              {posts.map(post => (
                <div key={post.id} style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f8f9fa' }}>
                  <strong>{post.display_name || post.username}</strong>
                  <br />
                  <div>{post.content}</div>
                  <small>Comments: {post.comments_count} | {new Date(post.created_at).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h3>Usage Instructions:</h3>
        <ol>
          <li>Make sure your backend server is running on <code>http://localhost:5000</code></li>
          <li>Import and use the API services in your React components like this:</li>
        </ol>
        
        <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto' }}>
{`import { userService, vehicleService, socialService } from '../services/api';

// In your component:
const [vehicles, setVehicles] = useState([]);

const loadVehicles = async () => {
  try {
    const data = await vehicleService.getAllVehicles();
    setVehicles(data);
  } catch (error) {
    console.error('Failed to load vehicles:', error);
  }
};

useEffect(() => {
  loadVehicles();
}, []);`}
        </pre>
      </div>
    </div>
  );
};

export default ApiExample;