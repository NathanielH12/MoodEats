import React from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DashboardNavBar from './DashboardNavBar';
import axios from 'axios';

function FavouritesPage({ token }) {
  const [favourites, setFavourites] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios.get('http://localhost:5500/favourites', {
      headers: { Authorization: token }
    })
      .then(res => setFavourites(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleClick = (f) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.name + ' ' + f.address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleRemove = async (e, placeId) => {
    e.stopPropagation();
    await axios.delete(`http://localhost:5500/favourites/${placeId}`, {
      headers: { Authorization: token }
    });
    setFavourites(prev => prev.filter((f) => f.placeId !== placeId));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <DashboardNavBar />
      <Box sx={{ padding: '2rem', color: 'white', flex: 1 }}>

        <Typography sx={{ fontWeight: 700, fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Favourites
        </Typography>
        <Typography sx={{ fontWeight: 400, fontSize: '1.25rem', marginBottom: '2rem', color: 'grey.400' }}>
          Your saved restaurants.
        </Typography>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CircularProgress size={24} sx={{ color: 'rgb(199, 121, 19)' }} />
            <Typography>Loading favourites...</Typography>
          </Box>
        )}

        {/* Empty state */}
        {!loading && favourites.length === 0 && (
          <Typography sx={{ color: 'grey.500', marginTop: '1rem' }}>
            You haven't saved any restaurants yet. Go find some! 🍽️
          </Typography>
        )}

        {/* Cards */}
        {!loading && favourites.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {favourites.map((f) => (
              <Card
                key={f.placeId}
                onClick={() => handleClick(f)}
                sx={{
                  width: 280,
                  backgroundColor: '#1e1e1e',
                  color: 'white',
                  borderRadius: '12px',
                  border: '1px solid rgba(199,121,19,0.3)',
                  cursor: 'pointer',
                }}
              >
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {f.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    <StarIcon sx={{ fontSize: '1rem', color: 'rgb(199, 121, 19)' }} />
                    <Typography sx={{ fontSize: '0.875rem', color: 'grey.400' }}>
                      {f.rating ?? 'No rating'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    <LocationOnIcon sx={{ fontSize: '1rem', color: 'grey.500', marginTop: '2px' }} />
                    <Typography sx={{ fontSize: '0.8rem', color: 'grey.400' }}>
                      {f.address}
                    </Typography>
                  </Box>

                  {/* Remove button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Chip
                      label="❤️ Remove"
                      size="small"
                      onClick={(e) => handleRemove(e, f.placeId)}
                      sx={{
                        backgroundColor: 'rgba(199,121,19,0.15)',
                        color: 'rgb(199,121,19)',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(199,121,19,0.3)' }
                      }}
                    />
                  </Box>

                </CardContent>
              </Card>
            ))}
          </Box>
        )}

      </Box>
    </Box>
  );
}

export default FavouritesPage;