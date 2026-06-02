import { Box, Typography, Button, CircularProgress, Card, CardContent, Chip } from '@mui/material';
import DashboardNavBar from './DashboardNavBar';
import React from 'react';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// outside the component so it doesn't get recreated on every render.
// string sent to the backend as the mood query parameter
const MOODS = [
  { label: 'Happy',        emoji: '😄', value: 'happy' },
  { label: 'Sad',          emoji: '😢', value: 'sad' },
  { label: 'Stressed',     emoji: '😤', value: 'stressed' },
  { label: 'Adventurous',  emoji: '🤠', value: 'adventurous' },
  { label: 'Romantic',     emoji: '🥰', value: 'romantic' },
  { label: 'Lazy',         emoji: '😴', value: 'lazy' },
];

function Dashboard({ token }) {
  // The components memory, whenever these changes React re-renders the UI
  const [selectedMood, setSelectedMood] = React.useState(null); // for when the user selects the mood
  const [restaurants, setRestaurants] = React.useState([]); // an array of restaurants returned from the backend
  const [favourites, setFavourites] = React.useState([]); // stores placeIds of saved restaurants
  const [loading, setLoading] = React.useState(false); // whether a fetch is currently in progress (controls the spinner)
  const [error, setError] = React.useState(''); // any API/backend error message to display
  const [locationError, setLocationError] = React.useState(''); // specifically for when the user denies location access

  React.useEffect(() => {
    axios.get('http://localhost:5500/favourites', {
      headers: { Authorization: token }
    })
      .then(res => {
        // store just the placeIds so we can check isSaved easily
        setFavourites(res.data.map((f) => f.placeId));
      })
      .catch(() => {}); // fail silently — favourites not critical to load
  }, [token]);

  const fetchRestaurants = (mood) => {
    // clears any previous error messages so stale errors don't linger.
    setError('');
    setLocationError('');

    // Checks if the browser supports geolocation at all — very old browsers don't. return exits early if not supported.
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    // shows the spinner
    setLoading(true);

    // getCurrentPosition is a browser API — it prompts the user for location permission and, if granted, 
    // calls the callback with a pos object containing pos.coords.latitude and pos.coords.longitude.
    /**
     * navigator is a global object provided by the browser automatically — you don't import it, install it, or create it.
     * It's just always available in any JavaScript code running in a browser environment.
     * 
     * navigator.geolocation.getCurrentPosition is a built-in browser API — nothing you install or import. You call it and pass it a callback function. The browser then:

      Shows the user a permission popup — "Allow this site to access your location?"

      If the user clicks Allow, the browser detects the device's GPS/WiFi/IP location

      The browser calls your callback and automatically passes in a GeolocationPosition object as the first argument — that's pos

      pos is an object the browser constructs and hands to you. Its shape is always:

      js
      pos = {
        coords: {
          latitude: -33.9416,   // degrees, e.g. Sydney
          longitude: 151.2041,  // degrees
          accuracy: 15,         // metres of accuracy
          altitude: null,       // if available
          speed: null,          // if moving
        },
        timestamp: 1716800000000
      }
     */
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await axios.get('http://localhost:5500/restaurants', {
            headers: { Authorization: token },
            params: {
              mood,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
          });
          setRestaurants(res.data.restaurants);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch restaurants.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationError('Location access denied. Please enable location permissions.');
        setLoading(false);
      }
    );
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);    // highlight the clicked button
    setRestaurants([]);       // clear previous results
    fetchRestaurants(mood);   // kick off the API call
  };

  const handleClick = (restaurant) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}`;
    window.open(mapsUrl, '_blank');
  }

  const toggleFavourite = async (e, r) => {
    e.stopPropagation(); // prevent the card's onClick (Maps) from firing

    const isSaved = favourites.includes(r.id);

    if (isSaved) {
      await axios.delete(`http://localhost:5500/favourites/${r.id}`, {
        headers: { Authorization: token }
      });
      setFavourites(prev => prev.filter(id => id !== r.id));
    } else {
      await axios.post('http://localhost:5500/favourites', {
        placeId: r.id,
        name: r.name,
        address: r.address,
        rating: r.rating
      }, {
        headers: { Authorization: token }
      });
      setFavourites(prev => [...prev, r.id]);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <DashboardNavBar />
        <Box sx={{ padding: '2rem', color: 'white', flex: 1 }}>

          {/* Header */}
          <Typography sx={{ fontWeight: 700, fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Dashboard
          </Typography>
          <Typography sx={{ fontWeight: 400, fontSize: '1.25rem', marginBottom: '2rem', color: 'grey.400' }}>
            Match your mood to open restaurants nearby.
          </Typography>

          {/* Mood Selector */}
          <Typography sx={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '1rem' }}>
            What are you feeling right now?
          </Typography>

          {/* .map() loops over the MOODS array and renders one MUI Button per mood.*/}
          <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {MOODS.map((mood) => (
              <Button
                key={mood.value}
                variant={selectedMood === mood.value ? 'contained' : 'outlined'}
                onClick={() => handleMoodSelect(mood.value)}
                sx={{
                  borderRadius: '999px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  padding: '0.5rem 1.5rem',
                  borderColor: 'rgb(199, 121, 19)',
                  color: selectedMood === mood.value ? 'white' : 'rgb(199, 121, 19)',
                  backgroundColor: selectedMood === mood.value ? 'rgb(199, 121, 19)' : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedMood === mood.value ? 'rgb(170, 100, 10)' : 'rgba(199,121,19,0.1)',
                  },
                }}
              >
                {mood.emoji} {mood.label}
              </Button>
            ))}
          </Box>

          {/* Error States */}
          {locationError && (
            <Typography sx={{ color: 'error.main', marginBottom: '1rem' }}>
              📍 {locationError}
            </Typography>
          )}
          {error && (
            <Typography sx={{ color: 'error.main', marginBottom: '1rem' }}>
              ⚠️ {error}
            </Typography>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <CircularProgress size={24} sx={{ color: 'rgb(199, 121, 19)' }} />
              <Typography>Finding restaurants near you...</Typography>
            </Box>
          )}

          {/* Results */}
          {!loading && restaurants.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '1rem' }}>
                🍽️ Restaurants for your {selectedMood} mood
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {restaurants.map((r) => (
                  <Card
                    key={r.id}
                    onClick={() => handleClick(r)}
                    sx={{
                      width: 280,
                      backgroundColor: '#1e1e1e',
                      color: 'white',
                      borderRadius: '12px',
                      border: '1px solid rgba(199,121,19,0.3)',
                    }}
                  >
                    <CardContent>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                        {r.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                        <StarIcon sx={{ fontSize: '1rem', color: 'rgb(199, 121, 19)' }} />
                        <Typography sx={{ fontSize: '0.875rem', color: 'grey.400' }}>
                          {r.rating ?? 'No rating'}
                        </Typography>
                        
                        <Typography sx={{ fontSize: '0.8rem', color: 'grey.400' }}>
                          - {r.priceLevel ?? 'Price unknown'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem', marginBottom: '0.75rem' }}>
                        <LocationOnIcon sx={{ fontSize: '1rem', color: 'grey.500', marginTop: '2px' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: 'grey.400' }}>
                          {r.address}
                        </Typography>
                      </Box>

                      <Chip
                        label={r.openNow === true ? 'Open Now' : r.openNow === false ? 'Closed' : 'Hours Unknown'}
                        size="small"
                        sx={{
                          backgroundColor: r.openNow === true ? 'rgba(67,122,34,0.3)' : 'rgba(161,44,123,0.3)',
                          color: r.openNow === true ? '#6daa45' : '#d163a7',
                          fontSize: '0.75rem',
                        }}
                      />

                      {/* ❤️ Favourite button */}
                      <Button
                        onClick={(e) => toggleFavourite(e, r)}
                        sx={{
                          minWidth: 0,
                          padding: '0.25rem',
                          fontSize: '1.2rem',
                          lineHeight: 1,
                          color: favourites.includes(r.id) ? 'rgb(199, 121, 19)' : 'grey.600',
                          '&:hover': { backgroundColor: 'transparent' },
                        }}
                      >
                        {favourites.includes(r.id) ? '❤️' : '🤍'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </>
          )}

          {/* Empty state */}
          {!loading && selectedMood && restaurants.length === 0 && !error && !locationError && (
            <Typography sx={{ color: 'grey.500', marginTop: '1rem' }}>
              No restaurants found nearby for this mood. Try a different mood!
            </Typography>
          )}

        </Box>
      </Box>
    </>
  );
}

export default Dashboard;