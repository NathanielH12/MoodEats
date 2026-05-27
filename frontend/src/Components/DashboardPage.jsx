import { Box, Typography } from '@mui/material';
import DashboardNavBar from './DashboardNavBar';

const fetchRestaurants = async (mood) => {
  // Get user coords via browser geolocation
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const res = await axios.get('http://localhost:5500/restaurants', {
      headers: { Authorization: token },
      params: {
        mood,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      },
    });
    setRestaurants(res.data.restaurants);
  });
};

function Dashboard() {
  return (
    <>
      <Box 
        sx={{ 
          display: 'flex',
        }}  
      >
        <DashboardNavBar />
        <Box 
          sx={{ 
            padding: '2rem',
            color: 'white',
            flex: 1,
          }}
        >
          <Typography 
            sx={{ 
              fontWeight: 700, 
              fontSize: '2.5rem', 
              marginBottom: '1rem' 
            }}
          >
            Dashboard
          </Typography>
          <Typography
            sx={{ 
              fontWeight: 400, 
              fontSize: '1.25rem', 
              marginBottom: '1rem' 
            }}
          >
            Welcome to your dashboard! Here you can match your mood to open restaurants.
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default Dashboard;