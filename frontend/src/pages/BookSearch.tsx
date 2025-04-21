import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Rating,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Book {
  title: string;
  authors: string;
  categories: string;
  average_rating: number;
  description: string;
  thumbnail: string;
}

const ITEMS_PER_PAGE = 100;

const BookSearch = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastBookElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch all books initially
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('Fetching books...');
        setLoading(true);
        setError(null);

        const response = await fetch('https://bookrecommenderbackend.onrender.com/books');
        console.log('Response received:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Data received, first book:', data[0]);
        
        if (!Array.isArray(data)) {
          throw new Error('Received data is not an array');
        }

        setBooks(data);
        setFilteredBooks(data);
        setDisplayedBooks(data.slice(0, ITEMS_PER_PAGE));
        setHasMore(data.length > ITEMS_PER_PAGE);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching books');
        setBooks([]);
        setFilteredBooks([]);
        setDisplayedBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBooks(books);
      setDisplayedBooks(books.slice(0, ITEMS_PER_PAGE));
      setPage(1);
      setHasMore(books.length > ITEMS_PER_PAGE);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = books.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(searchTermLower);
      const authorMatch = book.authors.toLowerCase().includes(searchTermLower);
      const categoryMatch = book.categories.toLowerCase().includes(searchTermLower);
      return titleMatch || authorMatch || categoryMatch;
    });
    
    setFilteredBooks(filtered);
    setDisplayedBooks(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [searchTerm, books]);

  // Handle pagination
  useEffect(() => {
    const endIndex = page * ITEMS_PER_PAGE;
    setDisplayedBooks(filteredBooks.slice(0, endIndex));
    setHasMore(endIndex < filteredBooks.length);
  }, [page, filteredBooks]);

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Book Search
          </Typography>
        </Box>

        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Search through our collection of {books.length} books by title, author, or category
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
          {displayedBooks.length === 0 ? (
            <Box sx={{ gridColumn: '1/-1', textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No books found matching your search criteria
              </Typography>
            </Box>
          ) : (
            displayedBooks.map((book, index) => (
              <Card
                key={index}
                ref={index === displayedBooks.length - 1 ? lastBookElementRef : null}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={book.thumbnail}
                  alt={book.title}
                  sx={{ 
                    objectFit: 'contain',
                    bgcolor: 'grey.50',
                    p: 1
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.2,
                      height: '2.4em'
                    }}
                  >
                    {book.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {book.authors}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={book.average_rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({book.average_rating.toFixed(1)})
                    </Typography>
                  </Box>
                  {book.categories && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {book.categories.split(',').slice(0, 3).map((category, idx) => (
                        <Chip key={idx} label={category.trim()} size="small" />
                      ))}
                    </Box>
                  )}
                  {book.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                        height: '4.2em'
                      }}
                    >
                      {book.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BookSearch; 