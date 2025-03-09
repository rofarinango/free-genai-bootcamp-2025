import axios from 'axios';
import type { 
  LastStudySession, 
  StudyProgress, 
  QuickStats, 
  StudyActivity, 
  PaginatedResponse, 
  StudySession,
  Word,
  WordFilter,
  WordCreate,
  Group,
  GroupDetails,
  GroupFilter,
  SessionFilter
} from '../types/api';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const dashboard = {
  getLastStudySession: () =>
    api.get<LastStudySession>('/dashboard/last_study_session').then(res => res.data),
  
  getStudyProgress: () =>
    api.get<StudyProgress>('/dashboard/study_progress').then(res => res.data),
  
  getQuickStats: () =>
    api.get<QuickStats>('/dashboard/quick-stats').then(res => res.data),
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const studyActivities = {
  getAll: () => fetchJson<StudyActivity[]>('/study-activities'),
  getById: (id: number) => fetchJson<StudyActivity>(`/study-activities/${id}`),
  getSessions: (id: number, page = 1) => 
    fetchJson<PaginatedResponse<StudySession>>(`/study-activities/${id}/study_sessions?page=${page}`),
  createSession: (groupId: number, activityId: number) =>
    fetchJson<{ id: number; group_id: number }>('/study-activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group_id: groupId, study_activity_id: activityId }),
    }),
};

export const words = {
  getAll: (filters?: WordFilter, page = 1) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.group_id) params.append('group_id', filters.group_id.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
    }
    params.append('page', page.toString());
    
    return api.get<PaginatedResponse<Word>>(`/words?${params.toString()}`).then(res => res.data);
  },

  getById: (id: number) =>
    api.get<Word>(`/words/${id}`).then(res => res.data),

  create: (word: WordCreate) =>
    api.post<Word>('/words', word).then(res => res.data),

  update: (id: number, word: Partial<WordCreate>) =>
    api.patch<Word>(`/words/${id}`, word).then(res => res.data),

  delete: (id: number) =>
    api.delete(`/words/${id}`).then(res => res.data),
};

export const groups = {
  getAll: (filters?: GroupFilter, page = 1) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
    }
    params.append('page', page.toString());
    
    return api.get<PaginatedResponse<Group>>(`/groups?${params.toString()}`).then(res => res.data);
  },

  getById: (id: number) =>
    api.get<GroupDetails>(`/groups/${id}`).then(res => res.data),

  getSessions: (id: number, page = 1) =>
    api.get<PaginatedResponse<StudySession>>(`/groups/${id}/study_sessions?page=${page}`).then(res => res.data),
};

export const sessions = {
  getAll: (filters?: SessionFilter, page = 1) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.group_id) params.append('group_id', filters.group_id.toString());
      if (filters.activity_id) params.append('activity_id', filters.activity_id.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
    }
    params.append('page', page.toString());
    
    return api.get<PaginatedResponse<StudySession>>(`/study-sessions?${params.toString()}`).then(res => res.data);
  },

  getById: (id: number) =>
    api.get<StudySession>(`/study-sessions/${id}`).then(res => res.data),

  resetHistory: () =>
    api.post('/study-sessions/reset').then(res => res.data),
}; 