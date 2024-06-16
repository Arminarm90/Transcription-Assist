from django.urls import path
from .views import audio_list, correct_text_ajax, get_lessons
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', audio_list, name='audio_list'),
    path('correct-text-ajax/', correct_text_ajax, name='correct_text_ajax'),
    path('get-lessons/', get_lessons, name='get_lessons'),
]
