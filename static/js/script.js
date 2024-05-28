async function start() {
  const pdfReader = document.getElementById("pdf-reader");

  pdfReader.src = "path/to/your/pdf/document.pdf";
  alert("Start button clicked and PDF loaded!");
}

function restart() {
  const textArea = document.getElementById("text-area");
  textArea.value = "";
  const pdfReader = document.getElementById("pdf-reader");
  pdfReader.src = "";
  alert("Restart button clicked and content cleared!");
}

async function spellCheck() {
  const textArea = document.getElementById("text-area");
  const text = textArea.value;

  try {
    const response = await fetch("/api/spell-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Spell check failed");
    }

    const result = await response.json();
    alert("Spell check result: " + JSON.stringify(result));
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function createPdf() {
  const textArea = document.getElementById("text-area");
  const text = textArea.value;

  try {
    const response = await fetch("/api/create-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Create PDF failed");
    }

    const result = await response.json();
    alert("PDF created: " + result.pdfUrl);
    const pdfReader = document.getElementById("pdf-reader");
    pdfReader.src = result.pdfUrl;
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function findMissingWords() {
  const textArea = document.getElementById("text-area");
  const text = textArea.value;

  try {
    const response = await fetch("/api/find-missing-words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Find missing words failed");
    }

    const result = await response.json();
    alert("Missing words: " + JSON.stringify(result));
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// player
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audio");
  const audioSource = document.getElementById("audio-source");
  const playlistItems = document.querySelectorAll(".playlist li");
  const startStopButton = document.getElementById("start-stop-button");
  const restartButton = document.getElementById("restart-button");
  const stopwatchDisplay = document.getElementById("stopwatch");
  const volumeButton = document.getElementById("volume-button");
  const volumeSlider = document.getElementById("volume-slider");
  const pauseButton = document.getElementById("pause-button");
  const timeDisplay = document.getElementById("time-display");
  let selectedAudioSrc = "";
  let stopwatchInterval;
  let elapsedTime = 0;

  playlistItems.forEach(item => {
    item.addEventListener('click', () => {
        playlistItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        selectedAudioSrc = item.getAttribute('data-src');
        console.log("Selected audio source: ", selectedAudioSrc); // Debugging line
    });
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
        startStopButton.textContent = "Stop";

        // Start the stopwatch
        startStopwatch();
      } else {
        alert("Please select a track from the playlist first.");
      }
    } else {
      // Stop the audio and stopwatch
      audio.pause();
      stopStopwatch();
      startStopButton.textContent = "Start";
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
      startAudio();
      resetStopwatch();
      startStopButton.textContent = "Stop";
      startAudio();
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
  // Disable seeking
  audio.addEventListener("seeking", (event) => {
    audio.currentTime = audio.currentTime; // Prevent seeking by resetting currentTime to the same value
  });

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
