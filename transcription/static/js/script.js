// select lesson
function loadLessons() {
  var unitId = document.getElementById("unit-select").value;
  fetch(`/get-lessons/?unit_id=${unitId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      var lessonSelect = document.getElementById("lesson-select");
      lessonSelect.innerHTML = "";
      data.forEach(function (lesson) {
        var option = document.createElement("option");
        option.value = lesson.id;
        option.text = lesson.title;
        lessonSelect.add(option);
      });
      updateUnitLessonName()
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

// updating book name input
function updateUnitLessonName() {
  var unitSelect = document.getElementById('unit-select');
  var lessonSelect = document.getElementById('lesson-select');
  var unitName = unitSelect.options[unitSelect.selectedIndex].text;
  document.getElementById('name-text-area').value = `${unitName}`;
}

// text corrector function
function correctText() {
  var content = document.getElementById("content").innerText;
  var unitId = document.getElementById('unit-select').value;
  var lessonId = document.getElementById('lesson-select').value;

  if (!unitId || !lessonId) {
      // Only highlight the -- placeholders if no unit or lesson is selected
      var highlightedContent = content.replace(/--/g, '<span style="color: red;">--</span>');
      document.getElementById('content').innerHTML = highlightedContent;
      return;
  }

  fetch("/correct-text-ajax/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: `lesson=${lessonId}&text=${encodeURIComponent(content)}`,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("content").innerHTML = data.corrected_text;
    })
    .catch((error) => {
      alert("Please select Unit and Track.");
      console.error("There was a problem with the fetch operation:", error);
    });
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

document.addEventListener("DOMContentLoaded", () => {
  let slashCounter = document.getElementById("slash-counter");
  let wordCounter = document.getElementById("word-counter");
  let editor = document.getElementById("editor-container");
  let textArea = document.getElementById("content");
  let text = document.getElementById("content").textContent;
  let missingWordsButton = document.getElementById("find-missing-words");
  let avarageCounter = document.getElementById("avarage-counter");
  let nameTextArea = document.getElementById("name-text-area");
  const audio = document.getElementById("audio");
  const audioSource = document.getElementById("audio-source");
  const playlistItems = document.querySelectorAll(".playlist li");
  const startStopButton = document.getElementById("start-stop-button");
  const restartButton = document.getElementById("restart-button");
  let createPDFButton = document.getElementById("create-pdf-button");
  const stopwatchDisplay = document.getElementById("stopwatch");
  const volumeButton = document.getElementById("volume-button");
  const volumeSlider = document.getElementById("volume-slider");
  const pauseButton = document.getElementById("pause-button");
  const progressBar = document.getElementById("progress-bar");
  const durationCheckbox = document.getElementById("duration-checkbox");
  const audioUpload = document.getElementById("audio-upload");
  let selectedAudioSrc = "";
  let stopwatchInterval;
  let elapsedTime = 0;

  // counting 
  (function () {
    // Function to update word count, slash count, and average words between slashes
    function updateCounts() {
      var text = document.getElementById("content").textContent;

      // Count words
      var words = text.trim().split(/\s+/);
      var wordCount = words.filter((word) => word.length > 0).length;

      // Count slashes
      var slashes = text.split("/").length - 1;
      var slashCount = slashes;

      // Calculate average words between slashes
      var average = 0;
      if (slashCount > 0) {
        var segments = text.split("/");
        var totalWordsInSegments = segments.reduce((total, segment) => {
          return (
            total +
            segment
              .trim()
              .split(/\s+/)
              .filter((word) => word.length > 0).length
          );
        }, 0);
        average = totalWordsInSegments / slashCount;
      }

      // Update the display
      document.getElementById("word-counter").textContent = wordCount;
      document.getElementById("slash-counter").textContent = slashCount;
      document.getElementById("avarage-counter").textContent =
        average.toFixed(2);
    }

    // Add event listener to the div to update counts on input
    document.getElementById("content").addEventListener("input", updateCounts);
  })();

  createPDFButton.addEventListener("click", function () {
    createPDF("");
  });

  // create PDF
  function createPDF(finalVersion) {
    if (nameTextArea.value === "") {
      alert("Plase enter the coursebook's name, part and page!");
      return;
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const fileName = `transcribe-${year}-${month}-${day}${finalVersion}.pdf`;

    window.jsPDF = window.jspdf.jsPDF;

    const doc = new jsPDF();

    const name = doc.splitTextToSize(`Lesson name: ${nameTextArea.value}`, 180);
    doc.text(15, 15, name);

    const detail = `Word count: ${wordCounter.innerHTML}   Slash count: ${slashCounter.innerHTML}   Avarage: ${avarageCounter.innerHTML}`;
    const details = doc.splitTextToSize(detail, 180);
    doc.setFontSize(14).setFont(undefined, "bold").text(15, 30, details);

    const lines = doc.splitTextToSize(textArea.textContent, 180);
    doc.setFontSize(14).setFont(undefined, "normal").text(15, 45, lines);

    doc.save(fileName);
  }

  // playlist and buttons
  playlistItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove active class from all items
      playlistItems.forEach((i) => i.classList.remove("active"));

      // Add active class to the clicked item
      item.classList.add("active");

      // Set the selected audio source
      selectedAudioSrc = item.getAttribute("data-src");
    });
  });

  audioUpload.addEventListener("change", () => {
    const file = audioUpload.files[0];
    if (file) {
      selectedAudioSrc = URL.createObjectURL(file);
      startStopButton.disabled = false;
      pauseButton.disabled = false;
    }
  });

  function startAudio() {
    if (selectedAudioSrc) {
      if (audio.src !== selectedAudioSrc) {
        // Update audio source and play if a new track is selected
        audioSource.src = selectedAudioSrc;
        audio.load();
      }
      audio.play();
    } else {
      alert("Please select a track from the playlist first.");
    }
  }

  startStopButton.addEventListener("click", () => {
    if (startStopButton.textContent === "Start") {
      if (selectedAudioSrc) {
        startAudio();
        textArea.contentEditable = true;
        startStopButton.textContent = "Stop";
        missingWordsButton.style.display = 'none';

        // Start the stopwatch
        startStopwatch();
      } else {
        alert("Please select a track from the playlist first.");
      }
    } else {
      // Stop the audio and stopwatch
      audio.pause();
      stopStopwatch();
      // textArea.disabled = true;
      startStopButton.textContent = "Start";
      missingWordsButton.style.display = 'inline-block';
    }
  });
  pauseButton.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      audio.pause();
      pauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
  });

  restartButton.addEventListener("click", () => {
    if (audioSource.src) {
      audio.currentTime = 0;
      audio.pause();
      textArea.contentEditable = false;
      resetStopwatch();
      stopStopwatch();
      textArea.textContent = "";
      slashCounter.innerHTML = "0";
      wordCounter.innerHTML = "0";
      avarageCounter.innerHTML = "0";
      startStopButton.textContent = "Start";
    } else {
      alert("Please select and start a track first.");
    }
  });

  volumeButton.addEventListener("click", () => {
    const isMuted = audio.muted;
    audio.muted = !isMuted;
    volumeButton.innerHTML = `<i class="fas fa-volume-${
      isMuted ? "up" : "mute"
    }"></i>`;
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  progressBar.addEventListener("input", () => {
    const seekTime = audio.duration * (progressBar.value / 100);
    audio.currentTime = seekTime;
  });

  progressBar.addEventListener("change", () => {
    if (!audio.paused) {
      audio.play(); // Ensure the audio continues playing after seeking
    }
  });

  durationCheckbox.addEventListener("change", () => {
    if (durationCheckbox.checked) {
      progressBar.style.display = "block";
    } else {
      progressBar.style.display = "none";
    }
  });

  // Disable seeking
  audio.addEventListener("timeupdate", (event) => {
    // audio.currentTime = audio.currentTime; // Prevent seeking by resetting currentTime to the same value
    updateProgressBar();
  });

  // stopwatch
  function startStopwatch() {
    const startTime = Date.now() - elapsedTime;
    stopwatchInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      stopwatchDisplay.textContent = formatTime(elapsedTime);
    }, 1000);
  }

  function stopStopwatch() {
    clearInterval(stopwatchInterval);
  }

  function resetStopwatch() {
    stopStopwatch();
    elapsedTime = 0;
    stopwatchDisplay.textContent = "00:00:00";
    startStopwatch();
  }

  function updateProgressBar() {
    if (audio.duration) {
      const value = (audio.currentTime / audio.duration) * 100;
      progressBar.value = value;
    }
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }
});

// text editor
function formatDoc(cmd, value = null) {
  if (value) {
    document.execCommand(cmd, false, value);
  } else {
    document.execCommand(cmd);
  }
}

function addLink() {
  const url = prompt("Insert url");
  formatDoc("createLink", url);
}

const content = document.getElementById("content");

content.addEventListener("mouseenter", function () {
  const a = content.querySelectorAll("a");
  a.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      content.setAttribute("contenteditable", false);
      item.target = "_blank";
    });
    item.addEventListener("mouseleave", function () {
      content.setAttribute("contenteditable", true);
    });
  });
});
