import React from 'react';
import { Box, Typography, Divider, CircularProgress, Button } from '@mui/material';
import DashboardNavBar from './DashboardNavBar';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile({ token, setToken }) {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    axios.get('http://localhost:5500/profile', {
      headers: { Authorization: token }
    })
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    navigate('/');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <DashboardNavBar />
      <Box sx={{ padding: '2rem', color: 'white', flex: 1 }}>

        {/* Header */}
        <Typography sx={{ fontWeight: 700, fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Profile
        </Typography>
        <Typography sx={{ fontWeight: 400, fontSize: '1.25rem', marginBottom: '2rem', color: 'grey.400' }}>
          Your account details.
        </Typography>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CircularProgress size={24} sx={{ color: 'rgb(199, 121, 19)' }} />
            <Typography>Loading profile...</Typography>
          </Box>
        )}

        {/* Profile Card */}
        {!loading && profile && (
          <Box sx={{
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            border: '1px solid rgba(199,121,19,0.3)',
            padding: '2rem',
            maxWidth: 480,
          }}>

            {/* Avatar */}
            <Box sx={{
              width: 72, height: 72, borderRadius: '50%',
              backgroundColor: 'rgba(199,121,19,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <PersonIcon sx={{ fontSize: 40, color: 'rgb(199,121,19)' }} />
            </Box>

            {/* Name */}
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              {profile.nameFirst} {profile.nameLast}
            </Typography>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', marginY: '1.25rem' }} />

            {/* Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <EmailIcon sx={{ color: 'grey.500', fontSize: '1.1rem' }} />
                <Typography sx={{ color: 'grey.400', fontSize: '0.95rem' }}>
                  {profile.email}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CalendarTodayIcon sx={{ color: 'grey.500', fontSize: '1.1rem' }} />
                <Typography sx={{ color: 'grey.400', fontSize: '0.95rem' }}>
                  Member since {formatDate(profile.createdAt)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FavoriteIcon sx={{ color: 'rgb(199,121,19)', fontSize: '1.1rem' }} />
                <Typography sx={{ color: 'grey.400', fontSize: '0.95rem' }}>
                  {profile._count.favourites} saved restaurant{profile._count.favourites !== 1 ? 's' : ''}
                </Typography>
              </Box>

            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', marginY: '1.25rem' }} />

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: 'rgba(199,121,19,0.5)',
                color: 'rgb(199,121,19)',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: 'rgb(199,121,19)',
                  backgroundColor: 'rgba(199,121,19,0.1)'
                }
              }}
            >
              Log Out
            </Button>

          </Box>
        )}

      </Box>
    </Box>
  );
}

export default Profile;