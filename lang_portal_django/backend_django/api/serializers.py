from rest_framework import serializers
from .models import Word, Group, StudySession, StudyActivity, WordReviewItem

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'

class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = '__all__'

class StudyActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyActivity
        fields = '__all__'

class WordReviewItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordReviewItem
        fields = '__all__'