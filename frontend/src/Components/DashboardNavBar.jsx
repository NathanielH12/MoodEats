import { Box, Typography, Link } from "@mui/material";

function DashboardNavBar() {
  return (
    <>
      <Box
        sx={{
          backgroundColor: 'rgb(9, 64, 147)',
          width: '80px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
      >
        <Typography sx={{ color: 'white', fontWeight: 700 }}>MoodEats</Typography>
        <Box 
          sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem', 
              marginTop: '2rem' 
            }}
          >
          <Link href="/dashboard" sx={{ color: 'white', textDecoration: 'none' }}>
            Home
          </Link>
          <Link href="/dashboard/recipes" sx={{ color: 'white', textDecoration: 'none' }}>
            Recipes
          </Link>
          <Link href="/dashboard/profile" sx={{ color: 'white', textDecoration: 'none' }}>
            Profile
          </Link>
          <Link href="/dashboard/settings" sx={{ color: 'white', textDecoration: 'none' }}>
            Settings
          </Link>
        </Box>
      </Box> 
    </>
  )
}

export default DashboardNavBar;