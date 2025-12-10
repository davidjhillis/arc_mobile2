# Voice Agent Feature Plan

## Overview
Add a Siri-like voice agent to the Red Cross Doctrine app that allows users to:
- Speak questions and commands naturally
- Get instant answers from doctrine
- Find specific articles by voice
- Listen to article content via TTS
- Have natural conversations about doctrine

## Architecture

### Components Needed

1. **Voice Input (Speech-to-Text)**
   - Browser Web Speech API (free, works offline)
   - Fallback: OpenAI Whisper API (more accurate, requires API key)
   - Visual feedback: waveform animation, listening indicator

2. **Voice Output (Text-to-Speech)**
   - Already implemented! Use existing TTS system
   - Play responses automatically after AI answers

3. **Voice Agent UI**
   - Floating microphone button (like Siri)
   - Press-and-hold to activate
   - Visual feedback during listening/speaking
   - Conversation history display

4. **Integration Points**
   - Reuse existing `/api/ai/chat` endpoint
   - Reuse existing TTS system
   - Reuse doctrine search logic

## Implementation Steps

### Phase 1: Basic Voice Input
- [ ] Create voice input hook using Web Speech API
- [ ] Add microphone button component
- [ ] Implement press-and-hold activation
- [ ] Add visual feedback (listening indicator)

### Phase 2: Voice Integration
- [ ] Connect voice input to existing chat API
- [ ] Display transcribed text
- [ ] Stream AI responses as before

### Phase 3: Voice Output
- [ ] Auto-play TTS responses after AI answers
- [ ] Add audio controls (pause, resume, stop)
- [ ] Visual feedback during playback

### Phase 4: Voice Commands
- [ ] Parse voice commands for specific actions:
  - "Find [article name]"
  - "Read [article name]"
  - "Summarize [article name]"
  - "What is [topic]?"
- [ ] Navigate to articles from voice commands

### Phase 5: Enhanced UX
- [ ] Conversation context management
- [ ] Wake word detection (optional)
- [ ] Background listening mode (optional)
- [ ] Voice activity detection (VAD)

## Technical Details

### Web Speech API
```javascript
const recognition = new webkitSpeechRecognition() // Chrome
const recognition = new SpeechRecognition() // Standard
recognition.continuous = false
recognition.interimResults = true
recognition.lang = 'en-US'
```

### Voice Commands Structure
- Natural language queries → AI chat (existing)
- Specific commands → Parse and execute:
  - "Find [X]" → Search doctrine, navigate to article
  - "Read [X]" → Navigate to article, auto-play TTS
  - "Summarize [X]" → Get summary, read aloud

### UI/UX Flow
1. User presses and holds microphone button
2. Visual feedback: "Listening..." with waveform
3. User speaks question/command
4. Release button → Stop listening
5. Show transcribed text
6. Stream AI response
7. Auto-play TTS response
8. Show conversation history

## Files to Create/Modify

### New Files
- `components/voice-agent.tsx` - Main voice agent component
- `hooks/use-speech-recognition.ts` - Speech-to-text hook
- `hooks/use-voice-agent.ts` - Voice agent orchestration hook

### Modified Files
- `components/screens/ask-screen.tsx` - Add voice input option
- `components/app-shell.tsx` - Add floating voice button
- `components/mobile-nav.tsx` - Optionally add voice shortcut

## Future Enhancements
- Wake word detection ("Hey Red Cross")
- Background listening mode
- Multi-language support
- Voice profiles for different users
- Offline voice recognition (using Web Speech API)
