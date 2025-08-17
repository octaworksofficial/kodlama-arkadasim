// Speech Recognition Setup
let recognition;
let isListening = false;

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
    };

    recognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';

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
            // Fix Turkish characters and process command
            const fixedCommand = fixTurkishChars(finalTranscript.trim());
            setTimeout(() => processVoiceCommand(fixedCommand), 1000);
        }
    };

    recognition.onerror = function(event) {
        console.error('Ses tanıma hatası:', event.error);
        stopListening();
        speechText.textContent = 'Ses tanımada sorun yaşandı. Tekrar dene! 😊';
    };

    recognition.onend = function() {
        stopListening();
        console.log('Ses tanıma sonlandı');
    };
}

// Stop listening
function stopListening() {
    isListening = false;
    micButton.classList.remove('recording');
    micPulse.classList.remove('active');
}

// Process voice command and determine code type
function processVoiceCommand(command) {
    console.log('Processing command:', command);
    
    // Show AI processing section
    showAIProcessing();
    
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
    
    // Simulate AI processing time
    setTimeout(() => {
        showGeneratedCode(codeType);
    }, 3000);
}

// Show AI processing section
function showAIProcessing() {
    speechSection.style.display = 'none';
    aiSection.style.display = 'block';
    codeSection.style.display = 'none';
    successSection.style.display = 'none';
}

// Show generated code section
function showGeneratedCode(codeType) {
    const code = codeTemplates[codeType] || codeTemplates.default;
    
    aiSection.style.display = 'none';
    codeSection.style.display = 'block';
    
    // Animate code typing
    typeCode(code);
}

// Type code with animation
function typeCode(code) {
    generatedCode.textContent = '';
    let i = 0;
    const speed = 30; // milliseconds per character
    
    function typeWriter() {
        if (i < code.length) {
            generatedCode.textContent += code.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    
    typeWriter();
}

// Show success section
function showSuccess() {
    codeSection.style.display = 'none';
    successSection.style.display = 'block';
    
    // Add some celebration sounds (visual feedback)
    console.log('🎉 Kodlar başarıyla yüklendi!');
}

// Restart the application
function restart() {
    speechSection.style.display = 'block';
    aiSection.style.display = 'none';
    codeSection.style.display = 'none';
    successSection.style.display = 'none';
    
    speechText.textContent = 'Sesini dinliyorum... 🎤';
}

// Event Listeners
micButton.addEventListener('click', function() {
    if (!recognition) {
        initSpeechRecognition();
    }
    
    if (!isListening) {
        recognition.start();
    } else {
        recognition.stop();
    }
});

uploadButton.addEventListener('click', function() {
    // Show upload animation
    uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yükleniyor...';
    uploadButton.disabled = true;
    
    // Simulate upload process
    setTimeout(() => {
        showSuccess();
    }, 2000);
});

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
