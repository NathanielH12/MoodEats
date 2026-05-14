import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  }

  return (
    <Box
      sx={{ 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography 
        sx={{ 
          fontWeight: 700, 
          fontSize: '5rem', 
          marginBottom: '1rem',
          color: 'rgb(241, 170, 78)',
          letterSpacing: '0.1rem'
        }}
      >
        Welcome to MoodEats
      </Typography>
      <Typography 
        sx={{ 
          fontWeight: 500, 
          fontSize: '1.75rem', 
          marginBottom: '2rem' 
        }}
      >
        Discover restaurants that match your mood!
      </Typography>
      <Button
        sx={{
          backgroundColor: 'rgb(199, 121, 19)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: 'pointer',
          fontWeight: 600,
        }}
        onClick={handleClick}
      >
        Get Started
      </Button>
    </Box>
  );
}

export default LandingPage;
