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
          fontSize: '3rem', 
          marginBottom: '1rem' 
        }}
      >
        Welcome to MoodEats
      </Typography>
      <Typography 
        sx={{ 
          fontWeight: 500, 
          fontSize: '1.25rem', 
          marginBottom: '2rem' 
        }}
      >
        Discover recipes that match your mood!
      </Typography>
      <Button
        sx={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        Get Started
      </Button>
    </Box>
  );
}

export default LandingPage;
