// Speech Recognition Setup
let recognition;
let isListening = false;
let speechTimeout;
let silenceTimeout;

// DOM Elements
const micButton = document.getElementById('micButton');
const micPulse = document.getElementById('micPulse');
const speechText = document.getElementById('speechText');
const speechSection = document.getElementById('speechSection');
const aiSection = document.getElementById('aiSection');
const codeSection = document.getElementById('codeSection');
const successSection = document.getElementById('successSection');
const uploadButton = document.getElementById('uploadButton');
const restartButton = document.getElementById('restartButton');
const generatedCode = document.getElementById('generatedCode');

// Sample Arduino codes for different voice commands
const codeTemplates = {
    'led': `// LED Kontrol Kodu
int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("LED Kontrol Sistemi Başlatıldı!");
}

void loop() {
  digitalWrite(ledPin, HIGH);   // LED'i aç
  delay(1000);                  // 1 saniye bekle
  digitalWrite(ledPin, LOW);    // LED'i kapat
  delay(1000);                  // 1 saniye bekle
}`,
    
    'motor': `// Motor Kontrol Kodu
int motorPin = 9;

void setup() {
  pinMode(motorPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Motor Kontrol Sistemi Hazır!");
}

void loop() {
  // Motoru hızlandır
  for(int speed = 0; speed <= 255; speed += 5) {
    analogWrite(motorPin, speed);
    delay(30);
  }
  
  // Motoru yavaşlat
  for(int speed = 255; speed >= 0; speed -= 5) {
    analogWrite(motorPin, speed);
    delay(30);
  }
}`,
    
    'sensor': `// Mesafe Sensörü Kodu
int trigPin = 12;
int echoPin = 11;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
  Serial.println("Mesafe Sensörü Aktif!");
}

void loop() {
  long duration, distance;
  
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;
  
  Serial.print("Mesafe: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  delay(1000);
}`,
    
    'servo': `// Servo Motor Kodu
#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
  Serial.begin(9600);
  Serial.println("Servo Motor Hazır!");
}

void loop() {
  // 0 dereceden 180 dereceye git
  for(int pos = 0; pos <= 180; pos += 1) {
    myServo.write(pos);
    delay(15);
  }
  
  // 180 dereceden 0 dereceye git
  for(int pos = 180; pos >= 0; pos -= 1) {
    myServo.write(pos);
    delay(15);
  }
}`,
    
    'default': `// Harika Bir Kod!
int ledPin = 13;
int buttonPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Projen hazır! Harika iş çıkardın!");
}

void loop() {
  if(digitalRead(buttonPin) == LOW) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Butona basıldı!");
    delay(500);
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(100);
}`
};

// Initialize Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        alert('Üzgünüm, tarayıcın ses tanıma özelliğini desteklemiyor. Chrome veya Safari kullanmayı dene!');
        return;
    }

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'tr-TR';
    recognition.maxAlternatives = 1;
    
    // Auto stop after 10 seconds
    recognition.serviceAutoStop = true;
    
    // Better Turkish language settings
    if (recognition.lang) {
        recognition.lang = 'tr-TR';
    }

    recognition.onstart = function() {
        isListening = true;
        micButton.classList.add('recording');
        micPulse.classList.add('active');
        speechText.textContent = 'Dinliyorum... 🎤 Ne yapmak istediğini söyle!';
        console.log('Ses tanıma başladı');
        
        // Auto stop after 10 seconds of listening
        speechTimeout = setTimeout(() => {
            console.log('10 saniye timeout - ses tanıma durduruluyor');
            if (isListening) {
                recognition.stop();
                speechText.textContent = 'Zaman doldu. Tekrar deneyin! ⏰';
            }
        }, 10000);
        
        // Stop after 3 seconds of silence
        silenceTimeout = setTimeout(() => {
            console.log('3 saniye sessizlik - ses tanıma durduruluyor');
            if (isListening) {
                recognition.stop();
            }
        }, 3000);
    };

    recognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Reset silence timeout when we get results
        if (silenceTimeout) {
            clearTimeout(silenceTimeout);
            silenceTimeout = setTimeout(() => {
                console.log('Yeni sessizlik timeout başlatıldı');
                if (isListening) {
                    recognition.stop();
                }
            }, 2000);
        }

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        const displayText = finalTranscript || interimTranscript;
        if (displayText.trim()) {
            // Fix Turkish characters in display
            const fixedDisplayText = fixTurkishChars(displayText.trim());
            speechText.textContent = `"${fixedDisplayText}"`;
        }

        if (finalTranscript.trim()) {
            console.log('Final transcript:', finalTranscript);
            // Stop recognition immediately when we get final result
            recognition.stop();
            
            // Fix Turkish characters and process command
            const fixedCommand = fixTurkishChars(finalTranscript.trim());
            setTimeout(() => processVoiceCommand(fixedCommand), 500);
        }
    };

    recognition.onerror = function(event) {
        console.error('Ses tanıma hatası:', event.error);
        stopListening();
        
        let errorMessage = 'Ses tanımada sorun yaşandı. Tekrar dene! 😊';
        
        switch(event.error) {
            case 'no-speech':
                errorMessage = 'Ses algılanamadı. Daha yüksek sesle konuşun! 🔊';
                break;
            case 'audio-capture':
                errorMessage = 'Mikrofon erişimi reddedildi. İzin verin! 🎤';
                break;
            case 'not-allowed':
                errorMessage = 'Mikrofon izni gerekli. Tarayıcı ayarlarını kontrol edin! ⚙️';
                break;
            case 'network':
                errorMessage = 'İnternet bağlantısı gerekli! 🌐';
                break;
            case 'aborted':
                errorMessage = 'Ses tanıma iptal edildi. �';
                break;
        }
        
        speechText.textContent = errorMessage;
    };

    recognition.onend = function() {
        stopListening();
        console.log('Ses tanıma sonlandı');
        
        // Clear timeouts
        if (speechTimeout) {
            clearTimeout(speechTimeout);
            speechTimeout = null;
        }
        if (silenceTimeout) {
            clearTimeout(silenceTimeout);
            silenceTimeout = null;
        }
    };
}

// Stop listening
function stopListening() {
    isListening = false;
    micButton.classList.remove('recording');
    micPulse.classList.remove('active');
    
    // Clear all timeouts
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        silenceTimeout = null;
    }
}

// Process voice command and determine code type
function processVoiceCommand(command) {
    console.log('Processing command:', command);
    
    // Show AI processing section with enhanced animation
    showAIProcessing(command);
    
    // Simulate API call delay
    simulateAPICall(command).then((codeType) => {
        // Show generated code with spectacular effects
        showGeneratedCode(codeType);
    });
}

// Simulate AI API call
function simulateAPICall(command) {
    return new Promise((resolve) => {
        // Determine code type based on voice command
        let codeType = 'default';
        const lowerCommand = command.toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
        
        // More comprehensive Turkish keyword matching
        if (lowerCommand.includes('led') || lowerCommand.includes('isik') || lowerCommand.includes('ışık') || 
            lowerCommand.includes('lamba') || lowerCommand.includes('ampul')) {
            codeType = 'led';
        } else if (lowerCommand.includes('motor') || lowerCommand.includes('hareket') || 
                   lowerCommand.includes('calistir') || lowerCommand.includes('çalıştır')) {
            codeType = 'motor';
        } else if (lowerCommand.includes('sensor') || lowerCommand.includes('sensör') || 
                   lowerCommand.includes('mesafe') || lowerCommand.includes('uzaklik') || 
                   lowerCommand.includes('uzaklık') || lowerCommand.includes('olc') || 
                   lowerCommand.includes('ölç')) {
            codeType = 'sensor';
        } else if (lowerCommand.includes('servo') || lowerCommand.includes('dondur') || 
                   lowerCommand.includes('döndür') || lowerCommand.includes('cevir') || 
                   lowerCommand.includes('çevir') || lowerCommand.includes('hareket')) {
            codeType = 'servo';
        }
        
        console.log('Detected code type:', codeType, 'for command:', command);
        
        // Simulate API processing steps
        setTimeout(() => updateAIStatus('🔍 Komutu analiz ediyorum...'), 500);
        setTimeout(() => updateAIStatus('🧠 Yapay zeka düşünüyor...'), 1500);
        setTimeout(() => updateAIStatus('⚡ Kod şablonunu oluşturuyorum...'), 2500);
        setTimeout(() => updateAIStatus('🎨 Son rötuşları yapıyorum...'), 3500);
        setTimeout(() => updateAIStatus('✨ Kodlar hazır!'), 4500);
        
        // Resolve after 5 seconds
        setTimeout(() => resolve(codeType), 5000);
    });
}

// Show AI processing section
function showAIProcessing(command) {
    speechSection.style.display = 'none';
    aiSection.style.display = 'block';
    codeSection.style.display = 'none';
    successSection.style.display = 'none';
    
    // Update AI title with user command
    const aiTitle = document.querySelector('.ai-title');
    if (command) {
        aiTitle.innerHTML = `"${command}" için mükemmel kodlar oluşturuluyor! ✨`;
    }
    
    // Start AI status updates
    updateAIStatus('🚀 API bağlantısı kuruluyor...');
}

// Update AI processing status
function updateAIStatus(message) {
    const aiTitle = document.querySelector('.ai-title');
    if (aiTitle) {
        aiTitle.innerHTML = message;
        
        // Add shake animation for excitement
        aiTitle.style.animation = 'none';
        setTimeout(() => {
            aiTitle.style.animation = 'bounce 0.6s ease-out';
        }, 10);
    }
}

// Show generated code section with spectacular effects
function showGeneratedCode(codeType) {
    const code = codeTemplates[codeType] || codeTemplates.default;
    
    // Hide AI section with fade effect
    aiSection.style.opacity = '0';
    setTimeout(() => {
        aiSection.style.display = 'none';
        codeSection.style.display = 'block';
        codeSection.style.opacity = '0';
        
        // Fade in code section
        setTimeout(() => {
            codeSection.style.opacity = '1';
            codeSection.style.transition = 'opacity 0.5s ease-in';
        }, 100);
        
        // Start spectacular code animation
        startCodeAnimation(code);
    }, 500);
}

// Spectacular code typing animation
function startCodeAnimation(code) {
    const codeTitle = document.querySelector('.code-title');
    const codeEditor = document.querySelector('.code-editor');
    
    // Animate title first
    codeTitle.style.transform = 'scale(0.8)';
    codeTitle.style.opacity = '0';
    
    setTimeout(() => {
        codeTitle.style.transform = 'scale(1)';
        codeTitle.style.opacity = '1';
        codeTitle.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 200);
    
    // Animate code editor appearance
    setTimeout(() => {
        codeEditor.style.transform = 'translateY(30px)';
        codeEditor.style.opacity = '0';
        
        setTimeout(() => {
            codeEditor.style.transform = 'translateY(0)';
            codeEditor.style.opacity = '1';
            codeEditor.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            
            // Start typing animation
            setTimeout(() => typeCode(code), 300);
        }, 100);
    }, 800);
}

// Enhanced type code with animation
function typeCode(code) {
    generatedCode.textContent = '';
    let i = 0;
    const speed = 25; // milliseconds per character
    
    // Add cursor effect
    const cursor = document.createElement('span');
    cursor.innerHTML = '|';
    cursor.style.animation = 'blink 1s infinite';
    cursor.style.color = '#4ade80';
    
    function typeWriter() {
        if (i < code.length) {
            const char = code.charAt(i);
            generatedCode.textContent += char;
            
            // Add syntax highlighting effect
            if (char === '\n') {
                // Scroll effect for new lines
                const codeContent = document.querySelector('.code-content');
                codeContent.scrollTop = codeContent.scrollHeight;
            }
            
            i++;
            setTimeout(typeWriter, speed);
        } else {
            // Remove cursor and show upload button with effect
            setTimeout(() => {
                showUploadButton();
            }, 500);
        }
    }
    
    typeWriter();
}

// Show upload button with spectacular animation
function showUploadButton() {
    const uploadButton = document.getElementById('uploadButton');
    uploadButton.style.transform = 'scale(0) rotate(180deg)';
    uploadButton.style.opacity = '0';
    uploadButton.style.display = 'block';
    
    setTimeout(() => {
        uploadButton.style.transform = 'scale(1) rotate(0deg)';
        uploadButton.style.opacity = '1';
        uploadButton.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        // Add pulsing effect
        setTimeout(() => {
            uploadButton.style.animation = 'pulse 2s infinite';
        }, 800);
    }, 200);
}

// Show success section with spectacular celebration
function showSuccess() {
    // Hide code section with fade
    codeSection.style.opacity = '0';
    codeSection.style.transition = 'opacity 0.5s ease-out';
    
    setTimeout(() => {
        codeSection.style.display = 'none';
        successSection.style.display = 'block';
        successSection.style.opacity = '0';
        
        // Spectacular entrance
        setTimeout(() => {
            successSection.style.opacity = '1';
            successSection.style.transition = 'opacity 0.8s ease-in';
            
            // Trigger confetti explosion
            triggerConfettiExplosion();
            
            // Success sound effect (visual)
            flashSuccessColors();
        }, 100);
    }, 500);
    
    // Add some celebration sounds (visual feedback)
    console.log('🎉 Kodlar başarıyla yüklendi!');
}

// Trigger confetti explosion effect
function triggerConfettiExplosion() {
    const successSection = document.getElementById('successSection');
    
    // Create multiple confetti elements
    for (let i = 0; i < 15; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${getRandomColor()};
            top: 50%;
            left: 50%;
            border-radius: 50%;
            animation: confettiExplode ${Math.random() * 2 + 2}s ease-out forwards;
            transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
            animation-delay: ${Math.random() * 0.5}s;
            pointer-events: none;
            z-index: 1000;
        `;
        
        successSection.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 4000);
    }
}

// Get random confetti color
function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98fb98', '#f0e68c'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Flash success colors across screen
function flashSuccessColors() {
    const body = document.body;
    const originalBg = body.style.background;
    
    // Flash green
    body.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    body.style.transition = 'background 0.3s ease-out';
    
    setTimeout(() => {
        body.style.background = originalBg;
    }, 300);
}

// Restart the application
function restart() {
    // Stop any ongoing recognition
    if (isListening && recognition) {
        recognition.stop();
    }
    
    // Clear all timeouts
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
    }
    if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        silenceTimeout = null;
    }
    
    // Reset UI
    speechSection.style.display = 'block';
    aiSection.style.display = 'none';
    codeSection.style.display = 'none';
    successSection.style.display = 'none';
    
    speechText.textContent = 'Mikrofona bas ve ne yapmak istediğini söyle! 🎤';
    
    // Reset button states
    stopListening();
}

// Event Listeners
micButton.addEventListener('click', function() {
    if (!recognition) {
        initSpeechRecognition();
    }
    
    if (!isListening) {
        console.log('Mikrofon butonu tıklandı - ses tanıma başlatılıyor');
        speechText.textContent = 'Başlatılıyor... 🎤';
        try {
            recognition.start();
        } catch (error) {
            console.error('Ses tanıma başlatma hatası:', error);
            speechText.textContent = 'Ses tanıma başlatılamadı. Tekrar deneyin! 😊';
        }
    } else {
        console.log('Mikrofon butonu tıklandı - ses tanıma durduruluyor');
        recognition.stop();
        speechText.textContent = 'Ses tanıma durduruldu. 🔇';
    }
});

uploadButton.addEventListener('click', function() {
    // Prevent multiple clicks
    if (uploadButton.disabled) return;
    
    // Show spectacular upload animation
    startUploadProcess();
});

// Spectacular upload process with multiple stages
function startUploadProcess() {
    const uploadButton = document.getElementById('uploadButton');
    
    // Stage 1: Button transformation
    uploadButton.style.transform = 'scale(0.95)';
    uploadButton.innerHTML = '<i class="fas fa-upload"></i> Yükleme başlatılıyor...';
    uploadButton.disabled = true;
    uploadButton.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    
    setTimeout(() => {
        // Stage 2: Connecting
        uploadButton.innerHTML = '<i class="fas fa-wifi"></i> Sunucuya bağlanıyor...';
        uploadButton.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    }, 800);
    
    setTimeout(() => {
        // Stage 3: Uploading
        uploadButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Kodlar yükleniyor...';
        uploadButton.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        
        // Add loading bar effect
        showLoadingProgress();
    }, 1600);
    
    setTimeout(() => {
        // Stage 4: Processing
        uploadButton.innerHTML = '<i class="fas fa-cog fa-spin"></i> İşleniyor...';
        uploadButton.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }, 2400);
    
    setTimeout(() => {
        // Stage 5: Success - show success section
        showUploadSuccess();
    }, 3200);
}

// Show loading progress bar
function showLoadingProgress() {
    const uploadButton = document.getElementById('uploadButton');
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, #10b981, #059669);
        border-radius: 0 0 20px 20px;
        animation: progressLoad 1.5s ease-out forwards;
        width: 0%;
    `;
    
    uploadButton.style.position = 'relative';
    uploadButton.style.overflow = 'hidden';
    uploadButton.appendChild(progressBar);
}

// Show upload success with celebration
function showUploadSuccess() {
    const uploadButton = document.getElementById('uploadButton');
    
    // Final button state
    uploadButton.innerHTML = '<i class="fas fa-check"></i> Başarılı!';
    uploadButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    uploadButton.style.transform = 'scale(1.1)';
    
    // Celebrate and transition to success
    setTimeout(() => {
        uploadButton.style.transform = 'scale(1)';
        showSuccess();
    }, 800);
}

restartButton.addEventListener('click', function() {
    restart();
});

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Kodlama Arkadaşı uygulaması yüklendi!');
    
    // Initialize speech recognition
    initSpeechRecognition();
    
    // Add some welcome animation
    setTimeout(() => {
        speechText.textContent = 'Mikrofona bas ve ne yapmak istediğini söyle! 🎤';
    }, 1000);
});

// Handle visibility change (when user switches tabs)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isListening) {
        recognition.stop();
    }
});

// Add some fun easter eggs
const easterEggs = [
    'Harika bir proje olacak bu! 🚀',
    'Sen gerçek bir programcısın! 👨‍💻',
    'Kodlama çok eğlenceli değil mi? 😄',
    'Bir sonraki projende ne yapmak istersin? 🤔',
    'Sen harika işler çıkarıyorsun! ⭐'
];

// Random encouragement messages
function showEncouragement() {
    const randomMessage = easterEggs[Math.floor(Math.random() * easterEggs.length)];
    console.log(randomMessage);
}

// Show encouragement every 30 seconds
setInterval(showEncouragement, 30000);

// Fix Turkish character encoding issues
function fixTurkishChars(text) {
    const turkishMap = {
        'Ä±': 'ı', 'Ä°': 'İ', 'Ã¼': 'ü', 'Ãœ': 'Ü',
        'Ã¶': 'ö', 'Ã–': 'Ö', 'Ä§': 'ç', 'Ã‡': 'Ç',
        'ÅŸ': 'ş', 'Åž': 'Ş', 'Ä±Å„': 'ğ', 'Äž': 'Ğ'
    };
    
    let fixedText = text;
    for (const [wrong, correct] of Object.entries(turkishMap)) {
        fixedText = fixedText.replace(new RegExp(wrong, 'g'), correct);
    }
    return fixedText;
}

// Enhanced speech recognition with Turkish character support
function enhancedProcessVoiceCommand(command) {
    // Fix potential Turkish character encoding issues
    const fixedCommand = fixTurkishChars(command);
    processVoiceCommand(fixedCommand);
}
