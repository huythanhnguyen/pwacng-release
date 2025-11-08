# VoiceTextField Component

An enhanced React component for voice recording with real-time pitch analysis and Vietnamese/English speech-to-text transcription.

## Features

### 🎵 Real-time Pitch Analysis
- **Custom autocorrelation algorithm** for accurate pitch detection
- **Visual waveform display** with HTML5 Canvas
- **Real-time pitch frequency** display in Hz (80-1000 Hz range)
- **Volume analysis** with percentage display
- **60fps updates** using requestAnimationFrame

### 🗣️ Multi-language Speech-to-Text
- **Vietnamese (vi-VN)** and **English (en-US, en-GB)** support
- Uses browser's Web Speech API (`SpeechRecognition`)
- **Language selector** with flag indicators
- **Real-time transcription** with interim and final results
- **Enhanced error handling** with user-friendly messages
- **Confidence scoring** and result logging

### 🎙️ Audio Recording
- High-quality audio capture (48kHz, mono)
- WebM recording with Opus codec
- Automatic conversion to 16kHz WAV format
- File size validation (5MB limit)
- Echo cancellation and noise suppression

## Installation

No additional dependencies required! The component uses only browser-native APIs and custom algorithms.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onChange` | `function` | - | Callback when recording completes |
| `label` | `string` | `'Record voice'` | Button label text |
| `absolute` | `boolean` | `false` | Absolute positioning |
| `processingClass` | `string` | `null` | CSS class for processing state |
| `showPitchAnalysis` | `boolean` | `true` | Enable pitch analysis UI |
| `enableSpeechToText` | `boolean` | `true` | Enable speech-to-text |
| `defaultLanguage` | `string` | `'vi-VN'` | Default STT language |
| `showLanguageSelector` | `boolean` | `true` | Show language dropdown |

## Supported Languages

| Language | Code | Flag | Support Level |
|----------|------|------|---------------|
| Vietnamese | `vi-VN` | 🇻🇳 | Full support |
| English (US) | `en-US` | 🇺🇸 | Full support |
| English (UK) | `en-GB` | 🇬🇧 | Full support |

## Usage

### Vietnamese + English with Language Selector
```jsx
import VoiceTextField from './VoiceTextField/voiceTextField';

const MyComponent = () => {
    const handleVoiceRecording = (result, fileSize) => {
        console.log('Audio data:', result.voice); // Base64 encoded
        console.log('Audio blob:', result.blob);  // Raw blob
        console.log('Transcription:', result.transcription);
        console.log('Language:', result.language); // vi-VN, en-US, etc.
        console.log('Last pitch:', result.pitch, 'Hz');
        console.log('File size:', fileSize, 'MB');
    };

    return (
        <VoiceTextField
            label="Bắt đầu ghi âm / Start Recording"
            onChange={handleVoiceRecording}
            showPitchAnalysis={true}
            enableSpeechToText={true}
            defaultLanguage="vi-VN"
            showLanguageSelector={true}
        />
    );
};
```

### Vietnamese Only
```jsx
<VoiceTextField
    label="Ghi âm tiếng Việt"
    onChange={handleVoiceRecording}
    defaultLanguage="vi-VN"
    showLanguageSelector={false}
    enableSpeechToText={true}
/>
```

### English Only
```jsx
<VoiceTextField
    label="Record in English"
    onChange={handleVoiceRecording}
    defaultLanguage="en-US"
    showLanguageSelector={false}
    enableSpeechToText={true}
/>
```

### Voice Recording Only (No STT)
```jsx
<VoiceTextField
    label="Record Audio Only"
    onChange={handleVoiceRecording}
    showPitchAnalysis={true}
    enableSpeechToText={false}
/>
```

## Browser Compatibility

### Web Speech API Support
- ✅ Chrome/Chromium (full support)
- ✅ Edge (full support)
- ✅ Safari (limited support)
- ❌ Firefox (not supported)

### Web Audio API Support
- ✅ All modern browsers
- ✅ Chrome, Firefox, Safari, Edge

### MediaRecorder API Support
- ✅ All modern browsers
- ✅ Chrome, Firefox, Safari, Edge

## Audio Analysis Details

### Pitch Detection
- **Algorithm**: Custom autocorrelation-based detection
- **Sample Rate**: 48kHz capture, processed in real-time
- **Range**: 80Hz - 1000Hz (human voice range)
- **Update Rate**: ~60fps (requestAnimationFrame)
- **Volume Analysis**: RMS-based volume calculation

### Waveform Visualization
- **Canvas Size**: 300x100 pixels
- **Update Rate**: Real-time with audio analysis
- **Style**: Green waveform on dark background

### Speech Recognition
- **Engine**: Browser's native SpeechRecognition
- **Mode**: Continuous with interim results
- **Default Language**: English (en-US)
- **Features**: Real-time transcription display

## Output Format

The `onChange` callback receives:

```javascript
{
    voice: {
        data: "base64EncodedAudioData",
        mime_type: "audio/wav"
    },
    blob: Blob, // Raw audio blob
    transcription: "văn bản được phiên âm...", // STT result
    language: "vi-VN", // Selected language code
    pitch: 440 // Last detected pitch in Hz
}
```

## Language-Specific Features

### Vietnamese (vi-VN)
- ✅ Real-time transcription
- ✅ Interim results
- ✅ Continuous recognition
- ✅ Vietnamese UI text ("Phiên âm:", "Đang nghe...", "Dừng")
- ✅ Optimized for Vietnamese speech patterns

### English (en-US, en-GB)
- ✅ Real-time transcription
- ✅ Interim results  
- ✅ Continuous recognition
- ✅ English UI text ("Transcription:", "Listening...", "Stop")
- ✅ High accuracy for English speech

## Browser Compatibility

### Vietnamese Speech Recognition
- ✅ Chrome/Chromium (excellent support)
- ✅ Edge (excellent support)
- ⚠️ Safari (limited support)
- ❌ Firefox (not supported)

### English Speech Recognition
- ✅ Chrome/Chromium (excellent support)
- ✅ Edge (excellent support)
- ✅ Safari (good support)
- ❌ Firefox (not supported)

## Styling

The component uses CSS Modules with TailwindCSS classes. Key style classes:

- `.recordingContainer` - Main container during recording
- `.pitchDisplay` - Pitch analysis section
- `.waveformCanvas` - Audio waveform canvas
- `.transcriptionContainer` - Speech-to-text section
- `.pitchValue` - Pitch frequency display
- `.transcriptionText` - Transcribed text display

## Performance Considerations

1. **Audio Processing**: Real-time analysis uses requestAnimationFrame
2. **Memory**: Canvas and audio contexts are properly cleaned up
3. **File Size**: Automatic conversion to efficient formats
4. **Battery**: Analysis stops when recording ends

## Error Handling

The component handles various error scenarios:

- Microphone permission denied
- Browser API not supported
- File size too large
- Audio processing failures
- Network issues (for cloud STT)

## Accessibility

- Keyboard navigation support
- Screen reader compatible
- Visual feedback for recording state
- Clear error messages

## Technical Architecture

```
User clicks → getUserMedia() → 
├── MediaRecorder (for file)
├── AudioContext → AnalyserNode → Pitch Detection
└── SpeechRecognition → Transcription

On Stop → 
├── Convert WebM to WAV
├── Return audio data + transcription + pitch
└── Cleanup resources
```

## Future Enhancements

- [ ] Language selection for STT
- [ ] Cloud STT integration (Google, Azure, AWS)
- [ ] Advanced pitch analysis (vibrato, formants)
- [ ] Audio effects (reverb, filters)
- [ ] Offline STT with TensorFlow.js
- [ ] Voice activity detection
- [ ] Multi-language support
- [ ] Audio visualization themes
