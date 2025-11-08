import React, { useState } from 'react';
import VoiceTextField from './voiceTextField';

const VoiceTextFieldDemo = () => {
    const [results, setResults] = useState([]);

    const handleVoiceRecording = (result, fileSize) => {
        const timestamp = new Date().toLocaleTimeString();
        const newResult = {
            id: Date.now(),
            timestamp,
            language: result.language,
            transcription: result.transcription,
            pitch: result.pitch,
            fileSize,
            audioUrl: URL.createObjectURL(result.blob)
        };
        
        setResults(prev => [newResult, ...prev].slice(0, 10)); // Keep last 10 results
        
        console.log('Vietnamese/English Voice Recording:', newResult);
    };

    const clearResults = () => {
        setResults([]);
    };

    const getLanguageFlag = (langCode) => {
        const flags = {
            'vi-VN': '🇻🇳',
            'en-US': '🇺🇸',
            'en-GB': '🇬🇧'
        };
        return flags[langCode] || '🌐';
    };

    const getLanguageName = (langCode) => {
        const names = {
            'vi-VN': 'Vietnamese',
            'en-US': 'English (US)',
            'en-GB': 'English (UK)'
        };
        return names[langCode] || langCode;
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🎤 Vietnamese & English Voice Recognition Demo</h2>
            
            <div style={{ marginBottom: '30px' }}>
                <h3>🤖 Automatic Language Detection</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    <strong>Just speak!</strong> The system automatically detects whether you're speaking Vietnamese or English.<br/>
                    <em>Chỉ cần nói! Hệ thống sẽ tự động nhận diện tiếng Việt hoặc tiếng Anh.</em>
                </p>
                
                <VoiceTextField
                    label="🤖 Speak Vietnamese or English"
                    onChange={handleVoiceRecording}
                    showPitchAnalysis={true}
                    enableSpeechToText={true}
                    autoDetectLanguage={true}  // Auto-detect language
                    defaultLanguage="vi-VN"
                    showLanguageSelector={false}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Recent Recordings</h3>
                {results.length > 0 && (
                    <button 
                        onClick={clearResults}
                        style={{
                            padding: '5px 10px',
                            marginBottom: '10px',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear Results
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {results.length === 0 ? (
                    <p style={{ 
                        color: '#999', 
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '40px',
                        border: '2px dashed #ddd',
                        borderRadius: '8px'
                    }}>
                        No recordings yet. Try recording something!<br/>
                        <small>Chưa có bản ghi nào. Thử ghi âm xem!</small>
                    </p>
                ) : (
                    results.map(result => (
                        <div 
                            key={result.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                backgroundColor: '#f9f9f9'
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '10px' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>
                                        {getLanguageFlag(result.language)}
                                    </span>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {getLanguageName(result.language)}
                                    </span>
                                </div>
                                <span style={{ color: '#666', fontSize: '12px' }}>
                                    {result.timestamp}
                                </span>
                            </div>
                            
                            {result.transcription && (
                                <div style={{ marginBottom: '10px' }}>
                                    <strong>Transcription:</strong>
                                    <div style={{ 
                                        padding: '8px',
                                        backgroundColor: 'white',
                                        border: '1px solid #eee',
                                        borderRadius: '4px',
                                        marginTop: '5px',
                                        fontFamily: 'monospace'
                                    }}>
                                        "{result.transcription}"
                                    </div>
                                </div>
                            )}
                            
                            <div style={{ 
                                display: 'flex', 
                                gap: '20px', 
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                {result.pitch && (
                                    <span>🎵 Pitch: {result.pitch} Hz</span>
                                )}
                                <span>📁 Size: {result.fileSize} MB</span>
                                <audio 
                                    controls 
                                    src={result.audioUrl}
                                    style={{ height: '30px' }}
                                >
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ 
                marginTop: '40px', 
                padding: '20px', 
                backgroundColor: '#f0f8ff',
                borderRadius: '8px',
                border: '1px solid #b0d4ff' 
            }}>
                <h4>💡 Tips for best results:</h4>
                <ul style={{ marginBottom: '10px' }}>
                    <li><strong>Vietnamese:</strong> Speak clearly and naturally. The system works well with Northern, Central, and Southern accents.</li>
                    <li><strong>English:</strong> Both US and UK accents are supported with high accuracy.</li>
                    <li><strong>Environment:</strong> Use in a quiet environment for best speech recognition results.</li>
                    <li><strong>Browser:</strong> Chrome and Edge provide the best experience for both languages.</li>
                </ul>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                    <strong>Lưu ý:</strong> Nói rõ ràng và tự nhiên để có kết quả phiên âm tốt nhất.
                </p>
            </div>
        </div>
    );
};

export default VoiceTextFieldDemo;
