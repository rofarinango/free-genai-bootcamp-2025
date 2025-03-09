import { ReactNode } from 'react';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';

interface CardProps {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <MuiCard>
      {title && (
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
        </CardContent>
      )}
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
} 