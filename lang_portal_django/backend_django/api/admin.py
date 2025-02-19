from django.contrib import admin
from .models import Word, Group, WordGroup, StudySession, StudyActivity, WordReviewItem

# Register your models here.
admin.site.register(Word)  # Register the Word model
admin.site.register(Group)  # Register the Group model
admin.site.register(WordGroup)  # Register the WordGroup model
admin.site.register(StudySession)  # Register the StudySession model
admin.site.register(StudyActivity)  # Register the StudyActivity model
admin.site.register(WordReviewItem)  # Register the WordReviewItem model
