import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.studyActivities': 'Study Activities',
    'nav.words': 'Words',
    'nav.groups': 'Groups',
    'nav.sessions': 'Sessions',
    'nav.settings': 'Settings',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.quickStats': 'Quick Stats',
    'dashboard.studyProgress': 'Study Progress',
    'dashboard.lastSession': 'Last Study Session',
    'dashboard.successRate': 'Success Rate',
    'dashboard.totalSessions': 'Total Sessions',
    'dashboard.activeGroups': 'Active Groups',
    'dashboard.studyStreak': 'Study Streak',
    'dashboard.days': 'days',
    'dashboard.wordsStudied': 'Words Studied',
    'dashboard.totalWords': 'Total Words',
    'dashboard.noLastSession': 'No study sessions yet',
    'dashboard.startStudying': 'Start Studying',

    // Study Activities
    'studyActivities.title': 'Study Activities',
    'studyActivities.launch': 'Launch',
    'studyActivities.viewDetails': 'View Details',
    'studyActivities.noActivities': 'No study activities available',
    'studyActivities.selectGroup': 'Select Group',
    'studyActivities.start': 'Start Activity',
    'studyActivities.cancel': 'Cancel',

    // Words
    'words.title': 'Words',
    'words.english': 'English',
    'words.spanish': 'Spanish',
    'words.correct': 'correct',
    'words.wrong': 'wrong',
    'words.noWords': 'No words found',
    'words.searchPlaceholder': 'Search words...',
    'words.filterByGroup': 'Filter by group',
    'words.allGroups': 'All Groups',
    'words.sortBy': 'Sort by',
    'words.sortOrder': 'Sort order',
    'words.ascending': 'Ascending',
    'words.descending': 'Descending',
    'words.performance': 'Performance',
    'words.groups': 'Groups',
    'words.addToGroup': 'Add to Group',
    'words.removeFromGroup': 'Remove from Group',

    // Groups
    'groups.title': 'Study Groups',
    'groups.words': 'Words',
    'groups.sessions': 'Sessions',
    'groups.lastStudied': 'Last Studied',
    'groups.never': 'Never',
    'groups.viewDetails': 'View Details',
    'groups.noGroups': 'No groups available',
    'groups.totalWords': 'Total Words',
    'groups.successRate': 'Success Rate',
    'groups.recentSessions': 'Recent Sessions',
    'groups.noSessions': 'No study sessions yet',
    'groups.wordsList': 'Words List',
    'groups.noWordsInGroup': 'No words in this group',

    // Sessions
    'sessions.title': 'Study Sessions',
    'sessions.activity': 'Activity',
    'sessions.group': 'Group',
    'sessions.date': 'Date',
    'sessions.duration': 'Duration',
    'sessions.itemsReviewed': 'Items Reviewed',
    'sessions.successRate': 'Success Rate',
    'sessions.noSessions': 'No study sessions found',
    'sessions.minutes': 'min',
    'sessions.items': 'items',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.interfaceLanguage': 'Interface Language',
    'settings.studyHistory': 'Study History',
    'settings.resetHistory': 'Reset Study History',
    'settings.resetWarning': 'Reset your study history, including all progress and statistics. This action cannot be undone.',
    'settings.saveChanges': 'Save Changes',
    'settings.saving': 'Saving...',
    'settings.resetting': 'Resetting...',
    'settings.saveSuccess': 'Settings saved successfully!',
    'settings.saveError': 'Failed to save settings. Please try again.',
    'settings.resetSuccess': 'Study history has been reset successfully!',
    'settings.resetError': 'Failed to reset history. Please try again.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred. Please try again.',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.noData': 'No data available',
    'common.confirm': 'Are you sure?',
    'common.previous': 'Previous',
    'common.next': 'Next',
    'common.page': 'Page',
    'common.of': 'of',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.studyActivities': 'Actividades',
    'nav.words': 'Palabras',
    'nav.groups': 'Grupos',
    'nav.sessions': 'Sesiones',
    'nav.settings': 'Ajustes',

    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.quickStats': 'Estadísticas Rápidas',
    'dashboard.studyProgress': 'Progreso de Estudio',
    'dashboard.lastSession': 'Última Sesión',
    'dashboard.successRate': 'Tasa de Éxito',
    'dashboard.totalSessions': 'Total de Sesiones',
    'dashboard.activeGroups': 'Grupos Activos',
    'dashboard.studyStreak': 'Racha de Estudio',
    'dashboard.days': 'días',
    'dashboard.wordsStudied': 'Palabras Estudiadas',
    'dashboard.totalWords': 'Total de Palabras',
    'dashboard.noLastSession': 'Sin sesiones de estudio',
    'dashboard.startStudying': 'Comenzar a Estudiar',

    // Study Activities
    'studyActivities.title': 'Actividades de Estudio',
    'studyActivities.launch': 'Iniciar',
    'studyActivities.viewDetails': 'Ver Detalles',
    'studyActivities.noActivities': 'No hay actividades disponibles',
    'studyActivities.selectGroup': 'Seleccionar Grupo',
    'studyActivities.start': 'Iniciar Actividad',
    'studyActivities.cancel': 'Cancelar',

    // Words
    'words.title': 'Palabras',
    'words.english': 'Inglés',
    'words.spanish': 'Español',
    'words.correct': 'correctas',
    'words.wrong': 'incorrectas',
    'words.noWords': 'No se encontraron palabras',
    'words.searchPlaceholder': 'Buscar palabras...',
    'words.filterByGroup': 'Filtrar por grupo',
    'words.allGroups': 'Todos los Grupos',
    'words.sortBy': 'Ordenar por',
    'words.sortOrder': 'Orden',
    'words.ascending': 'Ascendente',
    'words.descending': 'Descendente',
    'words.performance': 'Rendimiento',
    'words.groups': 'Grupos',
    'words.addToGroup': 'Agregar al Grupo',
    'words.removeFromGroup': 'Quitar del Grupo',

    // Groups
    'groups.title': 'Grupos de Estudio',
    'groups.words': 'Palabras',
    'groups.sessions': 'Sesiones',
    'groups.lastStudied': 'Último Estudio',
    'groups.never': 'Nunca',
    'groups.viewDetails': 'Ver Detalles',
    'groups.noGroups': 'No hay grupos disponibles',
    'groups.totalWords': 'Total de Palabras',
    'groups.successRate': 'Tasa de Éxito',
    'groups.recentSessions': 'Sesiones Recientes',
    'groups.noSessions': 'Sin sesiones de estudio',
    'groups.wordsList': 'Lista de Palabras',
    'groups.noWordsInGroup': 'No hay palabras en este grupo',

    // Sessions
    'sessions.title': 'Sesiones de Estudio',
    'sessions.activity': 'Actividad',
    'sessions.group': 'Grupo',
    'sessions.date': 'Fecha',
    'sessions.duration': 'Duración',
    'sessions.itemsReviewed': 'Items Revisados',
    'sessions.successRate': 'Tasa de Éxito',
    'sessions.noSessions': 'No se encontraron sesiones de estudio',
    'sessions.minutes': 'min',
    'sessions.items': 'items',

    // Settings
    'settings.title': 'Ajustes',
    'settings.language': 'Idioma',
    'settings.interfaceLanguage': 'Idioma de la Interfaz',
    'settings.studyHistory': 'Historial de Estudio',
    'settings.resetHistory': 'Reiniciar Historial',
    'settings.resetWarning': 'Reiniciar tu historial de estudio, incluyendo todo el progreso y estadísticas. Esta acción no se puede deshacer.',
    'settings.saveChanges': 'Guardar Cambios',
    'settings.saving': 'Guardando...',
    'settings.resetting': 'Reiniciando...',
    'settings.saveSuccess': '¡Ajustes guardados exitosamente!',
    'settings.saveError': 'Error al guardar los ajustes. Por favor intenta de nuevo.',
    'settings.resetSuccess': '¡El historial de estudio ha sido reiniciado exitosamente!',
    'settings.resetError': 'Error al reiniciar el historial. Por favor intenta de nuevo.',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error. Por favor intenta de nuevo.',
    'common.success': '¡Éxito!',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.noData': 'No hay datos disponibles',
    'common.confirm': '¿Estás seguro?',
    'common.previous': 'Anterior',
    'common.next': 'Siguiente',
    'common.page': 'Página',
    'common.of': 'de',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('userSettings');
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.language || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    const settings = localStorage.getItem('userSettings');
    const currentSettings = settings ? JSON.parse(settings) : {};
    localStorage.setItem('userSettings', JSON.stringify({
      ...currentSettings,
      language
    }));
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 