from django.db import models

class Word(models.Model):
    japanese = models.CharField(max_length=255)
    romaji = models.CharField(max_length=255)
    english = models.CharField(max_length=255)
    parts = models.JSONField()

class Group(models.Model):
    name = models.CharField(max_length=255)

class WordGroup(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

class StudySession(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class StudyActivity(models.Model):
    study_session = models.ForeignKey(StudySession, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class WordReviewItem(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    study_session = models.ForeignKey(StudySession, on_delete=models.CASCADE)
    correct = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
