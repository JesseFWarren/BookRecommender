import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  Stack,
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import QuizIcon from '@mui/icons-material/Quiz';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <AutoStoriesIcon sx={{ fontSize: 40 }} />,
      title: 'Personalized Recommendations with Depth',
      description: 'Get tailored suggestions from thousands of books based on your unique reading DNA. From writing style to thematic preferences.',
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Analysis',
      description: 'Our advanced model understands the nuances of your taste!',
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: { xs: 0, sm: '0 0 2rem 2rem' },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            alignItems="flex-start"
          >
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Discover Your Next Favorite Book
              </Typography>
              <Typography variant="h5" paragraph>
                Take our reading DNA quiz and get personalized recommendations that match your unique taste
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<QuizIcon />}
                onClick={() => navigate('/preferences')}
                sx={{ mt: 2 }}
              >
                Take the Quiz
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems="stretch"
        >
          {features.map((feature, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 4,
                flex: 1,
                textAlign: 'center',
                borderRadius: 4,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h5" component="h3" gutterBottom>
                {feature.title}
              </Typography>
              <Typography color="text.secondary">{feature.description}</Typography>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default Home; 