let backgroundMusic = null;
let clickSound = null;

// Volume settings
const DEFAULT_MUSIC_VOLUME = 0.3;
const DEFAULT_CLICK_VOLUME = 0.7;
const DUCK_VOLUME_PERCENTAGE = 0.25; // Music reduces to 25% of its original volume during clicks

// Initialize audio files
export function initializeAudio() {
  try {
    // Background music - using direct path relative to public folder
    backgroundMusic = new Audio('/assets/background.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = DEFAULT_MUSIC_VOLUME;
    
    console.log("Background music initialized at:", '/assets/background.mp3');
    
    // Click sound
    clickSound = new Audio('/assets/click.mp3');
    clickSound.volume = DEFAULT_CLICK_VOLUME;
    
    console.log("Click sound initialized at:", '/assets/click.mp3');
  } catch (error) {
    console.error("Error initializing audio:", error);
  }
}

// Control background music
export function playBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.play().catch(error => {
      console.error("Error playing background music:", error);
    });
    return true;
  }
  return false;
}

export function pauseBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    return true;
  }
  return false;
}

export function toggleBackgroundMusic() {
  if (!backgroundMusic) return false;
  
  if (backgroundMusic.paused) {
    return playBackgroundMusic();
  } else {
    pauseBackgroundMusic();
    return false;
  }
}

export function isBackgroundMusicPlaying() {
  return backgroundMusic && !backgroundMusic.paused;
}

// Play click sound
export function playClickSound() {
  if (clickSound && backgroundMusic) {
    // Save current music volume
    const originalVolume = backgroundMusic.volume;
    
    // Reduce background music volume during click (to 25% of original)
    backgroundMusic.volume = originalVolume * DUCK_VOLUME_PERCENTAGE;
    
    // Clone and play to allow overlapping sounds
    const clickInstance = clickSound.cloneNode();
    
    // Add event listener to restore volume when click sound ends
    clickInstance.addEventListener('ended', () => {
      backgroundMusic.volume = originalVolume;
    });
    
    // Play the click sound
    clickInstance.play().catch(error => {
      console.error("Error playing click sound:", error);
      // Restore volume in case of error
      backgroundMusic.volume = originalVolume;
    });
  } else if (clickSound) {
    // If no background music is playing, just play the click
    const clickInstance = clickSound.cloneNode();
    clickInstance.play().catch(error => {
      console.error("Error playing click sound:", error);
    });
  }
}
