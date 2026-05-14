import { Box, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MoodEatsLogo from '../assets/MoodEatsLogo.png';

function DashboardNavBar() {
  const navigate = useNavigate();

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'rgb(241, 170, 78)',
          width: '80px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
      >
        <Typography 
          sx={{ color: 'white', fontWeight: 700, cursor: "pointer" }}
          onClick={() => navigate('/')}
        >
          <img src={MoodEatsLogo} alt="MoodEats Logo" style={{ width: '80px', borderRadius: '50%' }} />
        </Typography>
        <Box 
          sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem', 
              marginTop: '2rem' 
            }}
          >
          <Link href="/dashboard" sx={{ color: 'white', fontWeight: 600, boxShadow: '0 2px 0 rgba(0,0,0,0.1)', textDecoration: 'none' }}>
            Home
          </Link>
          <Link href="/dashboard/recipes" sx={{ color: 'white', fontWeight: 600, boxShadow: '0 2px 0 rgba(0,0,0,0.1)', textDecoration: 'none' }}>
            Recipes
          </Link>
          <Link href="/dashboard/profile" sx={{ color: 'white', fontWeight: 600, boxShadow: '0 2px 0 rgba(0,0,0,0.1)', textDecoration: 'none' }}>
            Profile
          </Link>
          <Link href="/dashboard/settings" sx={{ color: 'white', fontWeight: 600, boxShadow: '0 2px 0 rgba(0,0,0,0.1)', textDecoration: 'none' }}>
            Settings
          </Link>
        </Box>
      </Box> 
    </>
  )
}

export default DashboardNavBar;