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
  Chip,
  Rating,
  TextField,
  Alert,
  CircularProgress,
  Backdrop,
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
  favoriteBooks: string;
  topics: string;
  mood: string;
  writingStyle: string;
  readingGoal: string;
}

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 
  'Romance', 'Thriller', 'Historical Fiction', 'Biography', 'Self-Help',
  'Science', 'Technology', 'Business', 'Philosophy', 'Poetry',
  'Horror', 'Adventure', 'Contemporary', 'Literary Fiction', 'Young Adult'
];

const MOODS = [
  'Happy and Uplifting',
  'Dark and Mysterious',
  'Thoughtful and Reflective',
  'Exciting and Adventurous',
  'Cozy and Comfortable',
  'Emotional and Moving',
  'Funny and Humorous',
  'Suspenseful and Tense'
];

const WRITING_STYLES = [
  'Descriptive and Poetic',
  'Direct and Simple',
  'Complex and Challenging',
  'Conversational and Casual',
  'Fast-paced and Dynamic',
  'Detailed and Technical'
];

const READING_GOALS = [
  'Entertainment and Escape',
  'Learning New Things',
  'Personal Growth',
  'Professional Development',
  'Literary Appreciation',
  'Cultural Understanding'
];

const UserPreferences = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    favoriteGenres: [],
    readingFrequency: '',
    preferredLength: '',
    favoriteAuthors: '',
    favoriteBooks: '',
    topics: '',
    mood: '',
    writingStyle: '',
    readingGoal: ''
  });

  const steps = ['Reading Habits', 'Favorites', 'Preferences', 'Goals'];

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
      setIsLoading(true);
      setError(null);

      // Convert answers to preferences array
      const preferences = [
        ...answers.favoriteGenres,
        answers.readingFrequency,
        answers.preferredLength,
        answers.favoriteAuthors,
        answers.favoriteBooks,
        answers.topics,
        answers.mood,
        answers.writingStyle,
        answers.readingGoal
      ].filter(Boolean);

      const response = await fetch('https://bookrecommenderbackend.onrender.com/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const recommendations = await response.json();
      navigate('/recommendations', { state: { recommendations } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit preferences');
    } finally {
      setIsLoading(false);
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
            <TextField
              fullWidth
              label="What are some books you've enjoyed recently?"
              placeholder="e.g., The Midnight Library, Project Hail Mary"
              value={answers.favoriteBooks}
              onChange={(e) => setAnswers(prev => ({ ...prev, favoriteBooks: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Who are some of your favorite authors?"
              placeholder="e.g., Andy Weir, Matt Haig"
              value={answers.favoriteAuthors}
              onChange={(e) => setAnswers(prev => ({ ...prev, favoriteAuthors: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="What topics interest you the most?"
              placeholder="e.g., space exploration, personal growth, ancient history"
              value={answers.topics}
              onChange={(e) => setAnswers(prev => ({ ...prev, topics: e.target.value }))}
              sx={{ mb: 3 }}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <FormLabel>What kind of mood are you in right now?</FormLabel>
              <RadioGroup
                value={answers.mood}
                onChange={(e) => setAnswers(prev => ({ ...prev, mood: e.target.value }))}
              >
                {MOODS.map((mood) => (
                  <FormControlLabel key={mood} value={mood.toLowerCase()} control={<Radio />} label={mood} />
                ))}
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <FormLabel>What writing style do you prefer?</FormLabel>
              <RadioGroup
                value={answers.writingStyle}
                onChange={(e) => setAnswers(prev => ({ ...prev, writingStyle: e.target.value }))}
              >
                {WRITING_STYLES.map((style) => (
                  <FormControlLabel key={style} value={style.toLowerCase()} control={<Radio />} label={style} />
                ))}
              </RadioGroup>
            </FormControl>

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
          </Box>
        );

      case 3:
        return (
          <Box>
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <FormLabel>What's your main goal for reading right now?</FormLabel>
              <RadioGroup
                value={answers.readingGoal}
                onChange={(e) => setAnswers(prev => ({ ...prev, readingGoal: e.target.value }))}
              >
                {READING_GOALS.map((goal) => (
                  <FormControlLabel key={goal} value={goal.toLowerCase()} control={<Radio />} label={goal} />
                ))}
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
          Personalized Reading Recommendations
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Help us understand your reading preferences to find your next favorite book
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, position: 'relative' }}>
          {isLoading && (
            <Backdrop
              sx={{
                position: 'absolute',
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
              }}
              open={true}
            >
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress color="primary" />
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    color: 'primary.main',
                    backgroundColor: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                  }}
                >
                  Finding your perfect books...
                </Typography>
              </Box>
            </Backdrop>
          )}

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
              disabled={activeStep === 0 || isLoading}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={isLoading}
            >
              {activeStep === steps.length - 1 ? (
                isLoading ? 'Finding Books...' : 'Get Recommendations'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserPreferences; 