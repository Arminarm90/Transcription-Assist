function toggleSpellCheck() {
  const textBox = document.getElementById("text-area");
  const button = document.getElementById("toggleButton");
  if (textBox.spellcheck) {
    textBox.spellcheck = false;
    button.textContent = "Spell Check: Off";
  } else {
    textBox.spellcheck = true;
    button.textContent = "Spell Check: On";
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

// async function findMissingWords() {
//   const textArea = document.getElementById("text-area");
//   const text = textArea.value;

//   try {
//     const response = await fetch("/api/find-missing-words", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ text }),
//     });

//     if (!response.ok) {
//       throw new Error("Find missing words failed");
//     }

//     const result = await response.json();
//     alert("Missing words: " + JSON.stringify(result));
//   } catch (error) {
//     alert("Error: " + error.message);
//   }
// }

// player
document.addEventListener("DOMContentLoaded", () => {
  let slashCounter = document.getElementById("slash-counter");
  let wordCounter = document.getElementById("word-counter");
  let textArea = document.getElementById("text-area");
  let missingWordsButton = document.getElementById("find-missing-words");
  const audio = document.getElementById("audio");
  const audioSource = document.getElementById("audio-source");
  const playlistItems = document.querySelectorAll(".playlist li");
  const startStopButton = document.getElementById("start-stop-button");
  const restartButton = document.getElementById("restart-button");
  const stopwatchDisplay = document.getElementById("stopwatch");
  const volumeButton = document.getElementById("volume-button");
  const volumeSlider = document.getElementById("volume-slider");
  const pauseButton = document.getElementById("pause-button");
  const progressBar = document.getElementById("progress-bar");
  const durationCheckbox = document.getElementById("duration-checkbox");
  let selectedAudioSrc = "";
  let stopwatchInterval;
  let elapsedTime = 0;
  textArea.disabled = true;

  textArea.addEventListener("input", function () {
    if (missingWordsButton.innerHTML === "Find missing words") {
      let text = textArea.value.trim();
      let numOfSlashes = text.split("/").length - 1;
      slashCounter.innerHTML = numOfSlashes;

      let textWithoutPunctuation = textArea.value.replace(/[^\w\s]/gi, "");
      let numberOfWords = textWithoutPunctuation
        .split(" ")
        .filter((word) => word !== "").length;
      wordCounter.innerHTML = numberOfWords;

      // let avg = numberOfWords / numOfSlashes;

      // if (isNaN(avg) || !isFinite(avg)) {
      //   avg = 0;
      // } else {
      //   avg = avg.toFixed(2);
      // }

      // avarageCounter.innerHTML = avg;
    }
  });

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
        textArea.disabled = false;
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
      textArea.disabled = true;
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
      audio.pause();
      // startAudio();
      textArea.disabled = true;
      resetStopwatch();
      stopStopwatch();
      textArea.value = "";
      startStopButton.textContent = "Start";
      // startAudio();
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
