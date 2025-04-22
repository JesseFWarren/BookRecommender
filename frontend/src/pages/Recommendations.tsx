import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Rating,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface Book {
  title: string;
  authors: string;
  categories: string;
  average_rating: number;
  description: string;
}

const Recommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const recommendations = location.state?.recommendations as Book[];

  if (!recommendations) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          No recommendations found. Please complete the preferences quiz first.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/preferences')}
          sx={{ mt: 2 }}
        >
          Take Quiz
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Personalized Book Recommendations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Based on your reading preferences, we think you'll love these books
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/preferences')}
            sx={{ mt: 2 }}
          >
            Retake Quiz
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {recommendations.map((book, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <MenuBookIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {book.title}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      by {book.authors}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {book.categories && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {book.categories.split(',').slice(0, 3).map((category, idx) => (
                      <Chip 
                        key={idx} 
                        label={category.trim()} 
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating 
                    value={book.average_rating} 
                    precision={0.1} 
                    readOnly 
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({book.average_rating.toFixed(1)})
                  </Typography>
                </Box>

                {book.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {book.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Recommendations; 