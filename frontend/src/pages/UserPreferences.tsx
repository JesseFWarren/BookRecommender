import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Slider,
  Chip,
  Stack,
  Rating,
  TextField,
  Autocomplete,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

interface QuizAnswer {
  questionId: string;
  answer: string | string[] | number;
}

interface RatingLabels {
  [key: number]: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'slider' | 'radio' | 'multiSelect' | 'rating' | 'bookInput';
  options?: string[];
  min?: number;
  max?: number;
  defaultValue?: number;
  marks?: { value: number; label: string }[];
  labels?: RatingLabels;
  placeholder?: string;
}

interface QuizStep {
  label: string;
  questions: QuizQuestion[];
}

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#1976d2',
  },
});

interface QuizAnswers {
  favoriteGenres: string[];
  readingFrequency: string;
  preferredLength: string;
  favoriteAuthors: string;
  topics: string;
  mood: string;
}

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 
  'Romance', 'Thriller', 'Historical Fiction', 'Biography', 'Self-Help',
  'Science', 'Technology', 'Business', 'Philosophy', 'Poetry'
];

const UserPreferences = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>({
    favoriteGenres: [],
    readingFrequency: '',
    preferredLength: '',
    favoriteAuthors: '',
    topics: '',
    mood: '',
  });

  const steps = ['Reading Habits', 'Preferences', 'Interests'];

  const handleGenreToggle = (genre: string) => {
    setAnswers(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Convert answers to preferences array
      const preferences = [
        ...answers.favoriteGenres,
        answers.readingFrequency,
        answers.preferredLength,
        answers.favoriteAuthors,
        answers.topics,
        answers.mood,
      ].filter(Boolean);

      const response = await fetch('http://localhost:5000/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      // Navigate to recommendations page
      navigate('/recommendations', { state: { recommendations: await response.json() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit preferences');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What genres do you enjoy reading?
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {GENRES.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  onClick={() => handleGenreToggle(genre)}
                  color={answers.favoriteGenres.includes(genre) ? 'primary' : 'default'}
                />
              ))}
            </Box>

            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <FormLabel>How often do you read?</FormLabel>
              <RadioGroup
                value={answers.readingFrequency}
                onChange={(e) => setAnswers(prev => ({ ...prev, readingFrequency: e.target.value }))}
              >
                <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                <FormControlLabel value="weekly" control={<Radio />} label="A few times a week" />
                <FormControlLabel value="monthly" control={<Radio />} label="A few times a month" />
                <FormControlLabel value="rarely" control={<Radio />} label="Rarely" />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <FormLabel>What length of books do you prefer?</FormLabel>
              <RadioGroup
                value={answers.preferredLength}
                onChange={(e) => setAnswers(prev => ({ ...prev, preferredLength: e.target.value }))}
              >
                <FormControlLabel value="short" control={<Radio />} label="Short (under 300 pages)" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium (300-500 pages)" />
                <FormControlLabel value="long" control={<Radio />} label="Long (over 500 pages)" />
                <FormControlLabel value="any" control={<Radio />} label="No preference" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label="Who are some of your favorite authors?"
              value={answers.favoriteAuthors}
              onChange={(e) => setAnswers(prev => ({ ...prev, favoriteAuthors: e.target.value }))}
              sx={{ mb: 3 }}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              label="What topics interest you the most?"
              placeholder="e.g., space exploration, ancient history, personal growth"
              value={answers.topics}
              onChange={(e) => setAnswers(prev => ({ ...prev, topics: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <FormLabel>What kind of mood or atmosphere do you prefer in books?</FormLabel>
              <RadioGroup
                value={answers.mood}
                onChange={(e) => setAnswers(prev => ({ ...prev, mood: e.target.value }))}
              >
                <FormControlLabel value="uplifting" control={<Radio />} label="Uplifting and Inspirational" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark and Mysterious" />
                <FormControlLabel value="thoughtful" control={<Radio />} label="Thoughtful and Reflective" />
                <FormControlLabel value="adventurous" control={<Radio />} label="Exciting and Adventurous" />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Reading Preferences Quiz
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Help us understand your reading preferences to provide better book recommendations
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Get Recommendations' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserPreferences; 