import { Link } from 'react-router-dom';
import type { StudyActivity } from '../../types/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';

interface StudyActivityCardProps {
  activity: StudyActivity;
  onLaunch: (activity: StudyActivity) => void;
}

export function StudyActivityCard({ activity, onLaunch }: StudyActivityCardProps) {
  const { t } = useLanguage();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        sx={{
          height: 350,
          objectFit: 'fill',
          backgroundColor: '#f5f5f5',
          p: 2
        }}
        image={activity.thumbnail_url}
        alt={activity.name}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="h3">
          {activity.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {activity.description}
        </Typography>
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => onLaunch(activity)}
            color="primary"
          >
            {t('studyActivities.launch')}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            component={Link}
            to={`/study-activities/${activity.id}`}
            color="primary"
          >
            {t('studyActivities.viewDetails')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 