from rest_framework import viewsets
from .models import Word, Group, StudySession, StudyActivity, WordReviewItem
from .serializers import WordSerializer, GroupSerializer, StudySessionSerializer, StudyActivitySerializer, WordReviewItemSerializer

class WordViewSet(viewsets.ModelViewSet):
    queryset = Word.objects.all()
    serializer_class = WordSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class StudySessionViewSet(viewsets.ModelViewSet):
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer

class StudyActivityViewSet(viewsets.ModelViewSet):
    queryset = StudyActivity.objects.all()
    serializer_class = StudyActivitySerializer

class WordReviewItemViewSet(viewsets.ModelViewSet):
    queryset = WordReviewItem.objects.all()
    serializer_class = WordReviewItemSerializer
