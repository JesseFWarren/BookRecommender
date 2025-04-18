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

const UserPreferences = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);

  const quizSteps: QuizStep[] = [
    {
      label: 'Reading Style',
      questions: [
        {
          id: 'readingFrequency',
          question: 'How often do you typically read?',
          type: 'radio',
          options: [
            'Daily',
            'A few times a week',
            'A few times a month',
            'Occasionally',
          ],
        },
        {
          id: 'readingMood',
          question: 'What kind of reading experience do you prefer?',
          type: 'rating',
          labels: {
            1: 'Light & Fun',
            3: 'Balanced',
            5: 'Deep & Thought-provoking',
          },
        },
      ],
    },
    {
      label: 'Genre Preferences',
      questions: [
        {
          id: 'genres',
          question: 'Select your favorite genres',
          type: 'multiSelect',
          options: [
            'Literary Fiction',
            'Mystery/Thriller',
            'Science Fiction',
            'Fantasy',
            'Romance',
            'Historical Fiction',
            'Non-fiction',
            'Biography',
            'Self-help',
            'Poetry',
            'Horror',
            'Adventure',
            'Contemporary Fiction',
            'Classics',
          ],
        },
        {
          id: 'subGenres',
          question: 'Any specific sub-genres you enjoy?',
          type: 'multiSelect',
          options: [
            'Psychological Thrillers',
            'Epic Fantasy',
            'Space Opera',
            'Historical Romance',
            'True Crime',
            'Popular Science',
            'Literary Classics',
            'Magical Realism',
            'Dystopian',
            'Contemporary Romance',
            'Political Non-fiction',
            'Philosophy',
          ],
        },
      ],
    },
    {
      label: 'Reading Preferences',
      questions: [
        {
          id: 'pacing',
          question: 'What kind of pacing do you prefer in your books?',
          type: 'slider',
          min: 0,
          max: 100,
          defaultValue: 50,
          marks: [
            { value: 0, label: 'Slow & Detailed' },
            { value: 50, label: 'Balanced' },
            { value: 100, label: 'Fast-paced' },
          ],
        },
        {
          id: 'complexity',
          question: 'How do you feel about complex writing styles?',
          type: 'radio',
          options: [
            'I prefer straightforward, easy-to-read prose',
            'I enjoy some complexity but nothing too challenging',
            'I love complex, literary writing styles',
          ],
        },
      ],
    },
    {
      label: 'Favorite Books',
      questions: [
        {
          id: 'favoriteBooks',
          question: 'Add some of your favorite books',
          type: 'bookInput',
          placeholder: 'Enter book titles you love',
        },
        {
          id: 'themes',
          question: 'What themes interest you most?',
          type: 'multiSelect',
          options: [
            'Coming of Age',
            'Good vs Evil',
            'Love & Relationships',
            'Social Justice',
            'Personal Growth',
            'Family Dynamics',
            'Politics & Power',
            'Science & Technology',
            'Mystery & Suspense',
            'Adventure & Exploration',
          ],
        },
      ],
    },
  ];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing !== -1) {
        const newAnswers = [...prev];
        newAnswers[existing] = { questionId, answer: value };
        return newAnswers;
      }
      return [...prev, { questionId, answer: value }];
    });
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
    handleAnswer('genres', selectedGenres);
  };

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'slider':
        return (
          <Box sx={{ width: '100%', mt: 4 }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>{question.question}</FormLabel>
            <Slider
              marks={question.marks}
              min={question.min}
              max={question.max}
              defaultValue={question.defaultValue}
              valueLabelDisplay="auto"
              onChange={(_, value) => handleAnswer(question.id, value)}
            />
          </Box>
        );
      case 'radio':
        return (
          <FormControl component="fieldset" sx={{ width: '100%', mt: 4 }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>{question.question}</FormLabel>
            <RadioGroup
              onChange={(e) => handleAnswer(question.id, e.target.value)}
            >
              {question.options.map((option: string) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'multiSelect':
        return (
          <Box sx={{ width: '100%', mt: 4 }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>
              {question.question}
            </FormLabel>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {question.options.map((option: string) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleGenreToggle(option)}
                  color={selectedGenres.includes(option) ? 'primary' : 'default'}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        );
      case 'rating':
        return (
          <Box sx={{ width: '100%', mt: 4 }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>{question.question}</FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StyledRating
                size="large"
                onChange={(_, value) => handleAnswer(question.id, value)}
                icon={<MenuBookIcon fontSize="inherit" />}
                emptyIcon={<MenuBookIcon fontSize="inherit" />}
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                {question.labels && 
                  (Object.entries(question.labels) as [string, string][]).map(([value, label]) => (
                    <Typography key={value} variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  ))
                }
              </Box>
            </Box>
          </Box>
        );
      case 'bookInput':
        return (
          <Box sx={{ width: '100%', mt: 4 }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>{question.question}</FormLabel>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={favoriteBooks}
              onChange={(_, newValue) => {
                setFavoriteBooks(newValue);
                handleAnswer(question.id, newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder={question.placeholder}
                />
              )}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Discover Your Reading DNA
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
          Help us understand your unique reading preferences
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {quizSteps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
          {activeStep === quizSteps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Thank you for completing the quiz!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We'll use your preferences to find the perfect books for you.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/recommendations')}
                sx={{ mt: 2 }}
                startIcon={<AutoStoriesIcon />}
              >
                See Your Recommendations
              </Button>
            </Box>
          ) : (
            <>
              {quizSteps[activeStep].questions.map((question) =>
                renderQuestion(question)
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<LocalLibraryIcon />}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<MenuBookIcon />}
                >
                  {activeStep === quizSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UserPreferences; 