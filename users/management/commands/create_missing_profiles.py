## Purpose of command: After adding profiles with one-to-one db link, previous super users didn't have profiles and couldn't access the django admin page.
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from users.models import Profile

class Command(BaseCommand):
    help = 'Creates profiles for users who do not have one'

    def handle(self, *args, **kwargs):
        for user in User.objects.all():
            Profile.objects.get_or_create(user=user)
        self.stdout.write(self.style.SUCCESS('Successfully created missing profiles'))