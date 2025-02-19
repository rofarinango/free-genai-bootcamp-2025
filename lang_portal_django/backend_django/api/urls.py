from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WordViewSet, GroupViewSet, StudySessionViewSet, StudyActivityViewSet, WordReviewItemViewSet

router = DefaultRouter()
router.register(r'words', WordViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'study_sessions', StudySessionViewSet)
router.register(r'study_activities', StudyActivityViewSet)
router.register(r'word_review_items', WordReviewItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]