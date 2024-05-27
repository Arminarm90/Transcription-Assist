from django.db import models

class AudioFile(models.Model):
    title = models.CharField(max_length=100)
    audio = models.FileField(upload_to='tracks/')

    def __str__(self):
        return self.title