from django.contrib import admin
from .models import AudioFile, Unit, Lesson
 
admin.site.register(Unit)
admin.site.register(Lesson)
admin.site.register(AudioFile)