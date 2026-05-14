import { Box, Typography } from '@mui/material';
import DashboardNavBar from './DashboardNavBar';

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