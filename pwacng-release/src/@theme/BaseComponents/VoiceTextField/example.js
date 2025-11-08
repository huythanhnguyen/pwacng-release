import React from 'react';
import VoiceTextField from './voiceTextField';

const ExampleUsage = () => {
    const handleVoiceRecording = (result, fileSize) => {
        console.log('Voice recording result:', {
            audioData: result.voice, // Base64 encoded audio data
            audioBlob: result.blob,  // Raw audio blob
            transcription: result.transcription, // Speech-to-text result
            pitch: result.pitch,     // Last detected pitch in Hz
            language: result.language, // Final language (detected or selected)
            detectedLanguage: result.detectedLanguage, // Auto-detected language
            wasAutoDetected: result.wasAutoDetected, // Was language auto-detected?
            fileSize: fileSize       // File size in MB
        });
        
        // Example: Display transcription with language info
        if (result.transcription) {
            const langInfo = result.wasAutoDetected 
                ? `auto-detected ${result.detectedLanguage}` 
                : `selected ${result.language}`;
            console.log(`Transcribed text (${langInfo}):`, result.transcription);
        }
        
        // Example: Display pitch information
        if (result.pitch) {
            console.log('Detected pitch:', result.pitch, 'Hz');
        }
    };

    return (
        <div>
            <h3>Auto-Detection: Vietnamese & English Speech-to-Text</h3>
            
            {/* AUTO-DETECTION: Automatically detects Vietnamese or English */}
            <VoiceTextField
                label="🤖 Speak in Vietnamese or English"
                onChange={handleVoiceRecording}
                showPitchAnalysis={true}
                enableSpeechToText={true}
                autoDetectLanguage={true}  // NEW: Auto-detect language
                defaultLanguage="vi-VN"     // Fallback language
                showLanguageSelector={false} // Hide manual selector
            />
            
            {/* MANUAL SELECTION: Traditional language selector */}
            <VoiceTextField
                label="Manual Language Selection"
                onChange={handleVoiceRecording}
                showPitchAnalysis={true}
                enableSpeechToText={true}
                autoDetectLanguage={false}  // Disable auto-detection
                defaultLanguage="vi-VN"
                showLanguageSelector={true}  // Show language dropdown
            />
            
            {/* VIETNAMESE ONLY */}
            <VoiceTextField
                label="Ghi âm tiếng Việt"
                onChange={handleVoiceRecording}
                showPitchAnalysis={true}
                enableSpeechToText={true}
                autoDetectLanguage={false}
                defaultLanguage="vi-VN"
                showLanguageSelector={false}
            />
            
            {/* ENGLISH ONLY */}
            <VoiceTextField
                label="Record in English"
                onChange={handleVoiceRecording}
                showPitchAnalysis={true}
                enableSpeechToText={true}
                autoDetectLanguage={false}
                defaultLanguage="en-US"
                showLanguageSelector={false}
            />
            
            {/* AUDIO ONLY (No Speech-to-Text) */}
            <VoiceTextField
                label="Record Audio Only"
                onChange={handleVoiceRecording}
                showPitchAnalysis={true}
                enableSpeechToText={false}
            />
        </div>
    );
};

export default ExampleUsage;
