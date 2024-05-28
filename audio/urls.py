from django.urls import path
from .views import audio_list
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', audio_list, name='audio_list')
]
