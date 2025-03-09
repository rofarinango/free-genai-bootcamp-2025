import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboard } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Typography,
  Box,
  Grid,
  Container,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip
} from '@mui/material';

export function Dashboard() {
  const { t } = useLanguage();
  const { data: lastSession } = useQuery({
    queryKey: ['lastStudySession'],
    queryFn: dashboard.getLastStudySession,
  });

  const { data: progress } = useQuery({
    queryKey: ['studyProgress'],
    queryFn: dashboard.getStudyProgress,
  });

  const { data: stats } = useQuery({
    queryKey: ['quickStats'],
    queryFn: dashboard.getQuickStats,
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('dashboard.title')}
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.successRate')}
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats?.success_rate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.totalSessions')}
              </Typography>
              <Typography variant="h3" color="primary.main">
                {stats?.total_study_sessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.activeGroups')}
              </Typography>
              <Typography variant="h3" sx={{ color: 'secondary.main' }}>
                {stats?.total_active_groups}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.studyStreak')}
              </Typography>
              <Typography variant="h3" color="warning.main">
                {stats?.study_streak_days} {t('dashboard.days')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Last Session and Progress */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.lastSession')}
              </Typography>
              {lastSession ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {t('groups.title')}: 
                    <Link to={`/groups/${lastSession.group_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <Typography component="span" color="primary" sx={{ ml: 1 }}>
                        {lastSession.group_name}
                      </Typography>
                    </Link>
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {t('sessions.date')}: {new Date(lastSession.created_at).toLocaleString()}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/study-activities/${lastSession.study_activity_id}`}
                    variant="contained"
                    sx={{ mt: 2 }}
                  >
                    {t('common.view')}
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  {t('dashboard.noLastSession')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.studyProgress')}
              </Typography>
              {progress && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip
                      label={t('dashboard.studyProgress')}
                      color="primary"
                      size="small"
                    />
                    <Typography variant="body2" color="primary">
                      {((progress.total_words_studied / progress.total_available_words) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(progress.total_words_studied / progress.total_available_words) * 100}
                    sx={{ height: 8, borderRadius: 1, mb: 2 }}
                  />
                  <Typography color="text.secondary">
                    {progress.total_words_studied} {t('words.title').toLowerCase()} {t('dashboard.wordsStudied')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 