from django.shortcuts import render
from .models import AudioFile, Unit, Lesson
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import difflib

# Audio files
def audio_list(request):
    audio_files = AudioFile.objects.all()
    units = Unit.objects.all()
    context = {"audio_files": audio_files, "units": units}

    return render(request, "audio/assist.html", context)

# Corrector
def correct_text(user_text, lesson_text):
    user_words = user_text.split()
    lesson_words = lesson_text.split()
    corrected_words = []
    lesson_index = 0

    matcher = difflib.SequenceMatcher(None, user_words, lesson_words)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            corrected_words.extend(user_words[i1:i2])
            lesson_index = j2
        elif tag == "replace":
            for i in range(i1, i2):
                if user_words[i] == "--":
                    if lesson_index < len(lesson_words):
                        corrected_words.append(
                            f'<span style="color: red;">{lesson_words[lesson_index]}</span>'
                        )
                        lesson_index += 1
                    else:
                        corrected_words.append('<span style="color: red;">--</span>')
                else:
                    if lesson_index < len(lesson_words):
                        corrected_words.append(
                            f'<span style="color: blue;">{user_words[i]}</span>'
                        )
                        lesson_index += 1
                    else:
                        corrected_words.append(
                            f'<span style="color: blue;">{user_words[i]}</span>'
                        )
        elif tag == "delete":
            for i in range(i1, i2):
                if user_words[i] == "--":
                    if lesson_index < len(lesson_words):
                        corrected_words.append(
                            f'<span style="color: red;">{lesson_words[lesson_index]}</span>'
                        )
                        lesson_index += 1
                    else:
                        corrected_words.append('<span style="color: red;">--</span>')
                else:
                    corrected_words.append(
                        f'<span style="color: blue;">{user_words[i]}</span>'
                    )
        elif tag == "insert":
            continue
        
        #optional
            # for j in range(j1, j2):
            #     corrected_words.append(
            #         f'<span style="color: green;">{lesson_words[j]}</span>'
            #     )

    return " ".join(corrected_words)


@csrf_exempt
def correct_text_ajax(request):
    if request.method == "POST":
        lesson_id = request.POST.get("lesson")
        text = request.POST.get("text")
        if not lesson_id or not text:
            return JsonResponse({"error": "Missing lesson or text"}, status=400)
        lesson = get_object_or_404(Lesson, id=lesson_id)
        corrected_text = correct_text(text, lesson.content)
        return JsonResponse({"corrected_text": corrected_text})
    return JsonResponse({"error": "Invalid request method"}, status=405)


def get_lessons(request):
    unit_id = request.GET.get("unit_id")
    if not unit_id:
        return JsonResponse({"error": "Missing unit ID"}, status=400)
    lessons = Lesson.objects.filter(unit_id=unit_id).values("id", "title")
    return JsonResponse(list(lessons), safe=False)
