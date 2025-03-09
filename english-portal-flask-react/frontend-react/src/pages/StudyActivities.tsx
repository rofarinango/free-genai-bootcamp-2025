import { useQuery } from '@tanstack/react-query';
import { studyActivities } from '../lib/api';
import { StudyActivityCard } from '../components/ui/StudyActivityCard';
import type { StudyActivity } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Typography, Box, Grid, Container } from '@mui/material';

export function StudyActivities() {
  const { t } = useLanguage();
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['study-activities'],
    queryFn: () => studyActivities.getAll(),
  });

  const handleLaunch = (activity: StudyActivity) => {
    window.open(`http://localhost:8081?activityId=${activity.id}`, '_blank');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="text.secondary">{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{t('common.error')}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('studyActivities.title')}
      </Typography>
      <Grid container spacing={3}>
        {activities?.length ? (
          activities.map((activity) => (
            <Grid item xs={12} sm={6} md={4} key={activity.id}>
              <StudyActivityCard
                activity={activity}
                onLaunch={handleLaunch}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Typography color="text.secondary">
                {t('studyActivities.noActivities')}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
} 