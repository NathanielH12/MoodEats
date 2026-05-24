import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import DashboardNavBar from './DashboardNavBar';

function Profile({ setToken }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5500/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setToken(null);
      navigate('/');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <DashboardNavBar />
      <Box
        sx={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#1a1a1a',
          color: 'white',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '2.5rem',
              color: 'white',
            }}
          >
            Profile
          </Typography>

          <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
            <LogoutIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>

        {/* Rest of profile content goes here */}

      </Box>
    </Box>
  );
}

export default Profile;