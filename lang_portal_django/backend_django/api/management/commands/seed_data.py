from django.core.management.base import BaseCommand
from api.models import Word, Group

class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **kwargs):
        # Create groups
        group1 = Group.objects.create(name="Basic Greetings")
        group2 = Group.objects.create(name="Common Phrases")

        # Create words
        Word.objects.create(japanese="こんにちは", romaji="konnichiwa", english="hello", parts={"kanji": "こんにちは"})
        Word.objects.create(japanese="さようなら", romaji="sayōnara", english="goodbye", parts={"kanji": "さようなら"})
        Word.objects.create(japanese="ありがとう", romaji="arigatou", english="thank you", parts={"kanji": "ありがとう"})

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database')) 