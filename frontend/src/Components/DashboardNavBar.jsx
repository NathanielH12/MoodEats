import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MoodEatsLogo from '../assets/MoodEatsLogo.png';
import styles from './Dashboard.module.css';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoodIcon from '@mui/icons-material/Mood';

function DashboardNavBar() {
  const navigate = useNavigate();

  function onProfileClick() {
    navigate('/profile');
  }

  function onFavClick() {
    navigate('/favourites');
  }

  return (
    <>
      <Box className={styles.dashboardNavBar}>
        <Box className={styles.logoSection}>
          <Typography
            sx={{ cursor: "pointer" }}
            onClick={() => navigate('/')}
          >
            <img
              src={MoodEatsLogo}
              alt="MoodEats Logo"
              style={{ width: '70px', borderRadius: '50%' }}
            />
          </Typography>
        </Box>

        <Box className={styles.navItemsContainer}>
          <Box className={styles.navItem} onClick={onProfileClick}>
            <PersonIcon sx={{ color: 'white', fontSize: 50 }} />
          </Box>

          <Box className={styles.navItem}>
            <MoodIcon sx={{ color: 'white', fontSize: 50 }} />
          </Box>

          <Box className={styles.navItem} onClick={onFavClick}>
            <FavoriteIcon sx={{ color: 'white', fontSize: 50 }} />
          </Box>
        </Box>
      </Box>

      <Box className={styles.dashboardMainContent}>
      </Box>
    </>
  );
}

export default DashboardNavBar;