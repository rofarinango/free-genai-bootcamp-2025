export interface LastStudySession {
  id: number;
  group_id: number;
  created_at: string;
  study_activity_id: number;
  group_name: string;
}

export interface StudyProgress {
  total_words_studied: number;
  total_available_words: number;
}

export interface QuickStats {
  success_rate: number;
  total_study_sessions: number;
  total_active_groups: number;
  study_streak_days: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface StudyActivity {
  id: number;
  name: string;
  description: string;
  thumbnail_url: string;
}

export interface StudySession {
  id: number;
  activity_name: string;
  group_name: string;
  start_time: string;
  end_time: string;
  review_items_count: number;
  success_rate: number;
}

export interface Word {
  id: number;
  english: string;
  spanish: string;
  correct_count: number;
  wrong_count: number;
  groups?: Array<{
    id: number;
    name: string;
  }>;
}

export interface WordFilter {
  search?: string;
  group_id?: number;
  sort_by?: 'english' | 'spanish' | 'correct_count' | 'wrong_count';
  sort_order?: 'asc' | 'desc';
}

export interface WordCreate {
  english: string;
  spanish: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  word_count: number;
  last_studied_at: string | null;
  total_sessions: number;
  success_rate: number;
}

export interface GroupDetails extends Group {
  words: Array<{
    id: number;
    english: string;
    spanish: string;
    correct_count: number;
    wrong_count: number;
  }>;
  recent_sessions: Array<{
    id: number;
    activity_name: string;
    start_time: string;
    end_time: string;
    review_items_count: number;
    success_rate: number;
  }>;
}

export interface GroupFilter {
  search?: string;
  sort_by?: 'name' | 'word_count' | 'last_studied_at' | 'success_rate';
  sort_order?: 'asc' | 'desc';
}

export interface SessionFilter {
  group_id?: number;
  activity_id?: number;
  sort_by?: 'start_time' | 'review_items_count' | 'success_rate';
  sort_order?: 'asc' | 'desc';
} 