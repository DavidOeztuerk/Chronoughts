import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Skeleton,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Psychology,
  CalendarToday,
  Hub,
  ZoomIn,
  ZoomOut,
  Today,
  DateRange,
  AllInclusive,
  Search,
  Star,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { fetchThoughts } from '../store/slices/thoughtsSlice';

interface TimelineItem {
  id: string;
  date: Date;
  thoughts: any[];
}

const Timeline: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { thoughts, loading } = useSelector((state: RootState) => state.thoughts);
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    dispatch(fetchThoughts({}));
  }, [dispatch]);

  // Group thoughts by date
  const groupThoughtsByDate = () => {
    const grouped: { [key: string]: any[] } = {};
    const now = new Date();
    const rangeStart = new Date();

    switch (timeRange) {
      case 'week':
        rangeStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        rangeStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        rangeStart.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        rangeStart.setFullYear(2000);
        break;
    }

    thoughts
      .filter(thought => {
        const thoughtDate = new Date(thought.createdAt);
        if (thoughtDate < rangeStart) return false;
        if (searchTerm && !thought.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !thought.content.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      .forEach(thought => {
        const date = new Date(thought.createdAt).toDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(thought);
      });

    return Object.entries(grouped)
      .map(([date, thoughts]) => ({
        id: date,
        date: new Date(date),
        thoughts: thoughts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timelineItems = groupThoughtsByDate();

  const TimelineNode = ({ item, index }: { item: TimelineItem; index: number }) => {
    const isLeft = index % 2 === 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        style={{ width: '100%' }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            mb: 4,
            position: 'relative',
          }}
        >
          {/* Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: index === timelineItems.length - 1 ? '50%' : '-2rem',
              width: 2,
              bgcolor: 'divider',
              transform: 'translateX(-50%)',
              zIndex: 0,
            }}
          />

          {/* Content Container */}
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              alignItems: 'flex-start',
              flexDirection: isLeft ? 'row' : 'row-reverse',
            }}
          >
            {/* Content Card */}
            <Box
              sx={{
                width: 'calc(50% - 2rem)',
                transform: `scale(${zoomLevel})`,
                transformOrigin: isLeft ? 'right center' : 'left center',
                transition: 'transform 0.3s',
              }}
            >
              <Card
                sx={{
                  background: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      {item.date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                    <Chip
                      label={`${item.thoughts.length} thoughts`}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>

                  {item.thoughts.map((thought, thoughtIndex) => (
                    <motion.div
                      key={thought.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + thoughtIndex * 0.05 }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          mb: thoughtIndex < item.thoughts.length - 1 ? 2 : 0,
                          bgcolor: 'background.default',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() => navigate(`/thoughts/${thought.id}`)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              width: 32,
                              height: 32,
                              mr: 1.5,
                            }}
                          >
                            <Psychology fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {thought.title}
                              </Typography>
                              {thought.importance > 3 && (
                                <Star fontSize="small" sx={{ ml: 1, color: 'warning.main' }} />
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                mb: 1,
                              }}
                            >
                              {thought.content}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label={thought.category}
                                size="small"
                                variant="outlined"
                              />
                              {thought.connectionsCount > 0 && (
                                <Chip
                                  icon={<Hub />}
                                  label={thought.connectionsCount}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                {new Date(thought.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </Box>

            {/* Center Node */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4rem',
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 48,
                  height: 48,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: 2,
                }}
              >
                <Psychology />
              </Avatar>
            </Box>

            {/* Empty space for alternating layout */}
            <Box sx={{ width: 'calc(50% - 2rem)' }} />
          </Box>
        </Box>
      </motion.div>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Thought Timeline
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore your thoughts chronologically
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search timeline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, value) => value && setTimeRange(value)}
            size="small"
          >
            <ToggleButton value="week">
              <Today fontSize="small" sx={{ mr: 0.5 }} />
              Week
            </ToggleButton>
            <ToggleButton value="month">
              <DateRange fontSize="small" sx={{ mr: 0.5 }} />
              Month
            </ToggleButton>
            <ToggleButton value="year">
              <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
              Year
            </ToggleButton>
            <ToggleButton value="all">
              <AllInclusive fontSize="small" sx={{ mr: 0.5 }} />
              All
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Zoom Out">
              <IconButton
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset Zoom">
              <IconButton onClick={() => setZoomLevel(1)}>
                {Math.round(zoomLevel * 100)}%
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <IconButton
                onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                disabled={zoomLevel >= 1.5}
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Timeline */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Skeleton variant="rectangular" height={150} sx={{ flexGrow: 1 }} />
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flexGrow: 1 }} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ position: 'relative', pt: 4, pb: 4 }}>
          <AnimatePresence>
            {timelineItems.length > 0 ? (
              timelineItems.map((item, index) => (
                <TimelineNode key={item.id} item={item} index={index} />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No thoughts in this time range
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try selecting a different time range or create new thoughts
                </Typography>
              </Box>
            )}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
};

export default Timeline;