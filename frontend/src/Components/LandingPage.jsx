import { Typography } from '@mui/material';

function LandingPage() {
  return (
    <div className="landing-page">
      <Typography className="landingPageTitle">Welcome to MoodEats</Typography>
      <Typography className="landingPageSubtitle">Discover recipes that match your mood!</Typography>
      <button className="getStartedBtn">Get Started</button>
    </div>
  )
}

export default LandingPage;