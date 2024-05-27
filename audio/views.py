from django.shortcuts import render
from .models import AudioFile

def audio_list(request):
    audio_files = AudioFile.objects.all()
    return render(request, 'audio/audio_list.html', {'audio_files': audio_files})