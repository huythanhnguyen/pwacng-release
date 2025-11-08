import React from 'react';
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useToasts} from "@magento/peregrine";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./voiceTextField.module.scss";
import {useIntl} from "react-intl";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Simple autocorrelation-based pitch detection
const detectPitch = (buffer, sampleRate) => {
    // Minimum and maximum pitch frequencies we want to detect
    const minFreq = 80;  // Hz
    const maxFreq = 1000; // Hz

    // Convert frequency range to sample delays
    const minPeriod = Math.floor(sampleRate / maxFreq);
    const maxPeriod = Math.floor(sampleRate / minFreq);

    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;

    // Calculate RMS for volume threshold
    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);

    // If signal is too quiet, return null
    if (rms < 0.01) return null;

    // Autocorrelation
    for (let offset = minPeriod; offset <= maxPeriod && offset < buffer.length / 2; offset++) {
        let correlation = 0;

        for (let i = 0; i < buffer.length - offset; i++) {
            correlation += Math.abs(buffer[i] - buffer[i + offset]);
        }

        correlation = 1 - (correlation / (buffer.length - offset));

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
    }

    // Only return pitch if correlation is strong enough
    if (bestCorrelation > 0.3 && bestOffset !== -1) {
        return sampleRate / bestOffset;
    }

    return null;
};

// Simple volume analysis
const analyzeVolume = (buffer) => {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
};

const fileTooLarge = (fileOrBlob, maxBytes = MAX_BYTES) => {
    return (fileOrBlob?.size || 0) > maxBytes;
}

const blobToDataType = blob => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const [prefix, b64] = String(reader.result).split(',');
            const mime = prefix.match(/^data:(.*?);base64$/)?.[1] || blob.type || '';
            resolve({ data: b64, mime_type: mime });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

const formatTime = ms => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
};

const VoiceTextField = props => {
    const {
        onChange,
        label = 'Record voice',
        absolute = false,
        processingClass = null,
        showPitchAnalysis = true,
        enableSpeechToText = true,
        autoDetectLanguage = true, // NEW: Enable automatic language detection
        defaultLanguage = 'vi-VN', // Fallback language
        showLanguageSelector = false // Hide selector when auto-detect is enabled
    } = props

    const classes = useStyle(defaultClasses, props.classes);
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();

    // Use react-speech-recognition hook for stable speech recognition
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const mediaRef = React.useRef({ stream: null, recorder: null, chunks: [] });
    const audioContextRef = React.useRef(null);
    const analyserRef = React.useRef(null);
    const sourceRef = React.useRef(null);
    const pitchAnalysisRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const timerRef = React.useRef(null);
    const finalTranscriptRef = React.useRef(''); // Store final transcript to persist through stop

    const [recording, setRecording] = React.useState(false);
    const [elapsed, setElapsed] = React.useState(0);
    const [currentPitch, setCurrentPitch] = React.useState(null);
    const [currentVolume, setCurrentVolume] = React.useState(0);
    const [selectedLanguage, setSelectedLanguage] = React.useState(defaultLanguage);
    const [detectedLanguage, setDetectedLanguage] = React.useState(null);
    const [isAutoDetecting, setIsAutoDetecting] = React.useState(false);

    // Language options for speech recognition
    const languageOptions = [
        { code: 'vi-VN', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
        { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' }
    ];

    // Vietnamese language detection patterns
    const vietnamesePatterns = [
        // Vietnamese diacritics and characters
        /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i,
        // Common Vietnamese words
        /\b(là|của|và|có|không|được|này|đó|với|cho|tôi|bạn|chúng|những|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\b/i,
        // Vietnamese particles and connectors
        /\b(mà|nếu|thì|vì|nên|để|khi|như|theo|từ|tại|trong|ngoài|trên|dưới|giữa)\b/i,
        // Vietnamese pronouns and common phrases
        /\b(xin chào|cảm ơn|xin lỗi|tạm biệt|chào bạn|làm ơn|rất vui)\b/i
    ];

    // English language detection patterns
    const englishPatterns = [
        // Common English words
        /\b(the|and|or|but|is|are|was|were|have|has|had|will|would|could|should|this|that|with|for|from|they|them|their|there|where|when|what|who|how)\b/i,
        // English articles and prepositions
        /\b(a|an|in|on|at|by|to|of|up|down|over|under|through|between|among|during|before|after)\b/i,
        // Common English phrases
        /\b(hello|thank you|please|sorry|goodbye|excuse me|how are you|nice to meet you)\b/i,
        // English question words
        /\b(what|where|when|why|who|which|whose|whom|how much|how many|how long)\b/i
    ];

    // Detect language from text
    const detectLanguageFromText = (text) => {
        if (!text || text.trim().length < 3) return null;

        const normalizedText = text.toLowerCase().trim();

        // Count matches for each language
        let vietnameseScore = 0;
        let englishScore = 0;

        // Check Vietnamese patterns
        vietnamesePatterns.forEach(pattern => {
            const matches = normalizedText.match(pattern);
            if (matches) {
                vietnameseScore += matches.length;
            }
        });

        // Check English patterns
        englishPatterns.forEach(pattern => {
            const matches = normalizedText.match(pattern);
            if (matches) {
                englishScore += matches.length;
            }
        });

        // Check for Vietnamese diacritics (strong indicator)
        const vietnameseDiacritics = (normalizedText.match(/[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/g) || []).length;
        if (vietnameseDiacritics > 0) {
            vietnameseScore += vietnameseDiacritics * 3; // Weight diacritics heavily
        }

        // Determine language based on scores
        if (vietnameseScore > englishScore && vietnameseScore > 0) {
            return 'vi-VN';
        } else if (englishScore > vietnameseScore && englishScore > 0) {
            return 'en-US';
        }

        return null; // Unable to detect
    };

    // Store transcript in ref to persist through stop process
    React.useEffect(() => {
        finalTranscriptRef.current = transcript;
    }, [transcript]);

    // Language detection effect for auto-detect feature
    React.useEffect(() => {
        if (autoDetectLanguage && transcript && transcript.trim().length > 10) {
            const detected = detectLanguageFromText(transcript);
            if (detected && detected !== selectedLanguage) {
                console.log(`Language auto-detected: ${detected} (was ${selectedLanguage})`);
                setDetectedLanguage(detected);
                setSelectedLanguage(detected);
                setIsAutoDetecting(false);

                // Change speech recognition language
                SpeechRecognition.getRecognition().lang = detected;
            } else if (detected) {
                setDetectedLanguage(detected);
                setIsAutoDetecting(false);
            }
        }
    }, [transcript, autoDetectLanguage, selectedLanguage]);

    // Check browser support
    React.useEffect(() => {
        if (enableSpeechToText && !browserSupportsSpeechRecognition) {
            /*addToast({
                type: 'warning',
                icon: errorIcon,
                message: 'Speech Recognition not supported in this browser. Try using Chrome or Edge.',
                dismissable: true,
                timeout: 5000
            });*/
            console.log('Speech Recognition not supported in this browser. Try using Chrome or Edge.');
        }
    }, [enableSpeechToText, browserSupportsSpeechRecognition, addToast]);

    const startTimer = () => {
        const start = Date.now();
        timerRef.current = setInterval(() => setElapsed(Date.now() - start), 250);
    };
    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setElapsed(0);
    };

    // Initialize Audio Analysis
    const initAudioAnalysis = (stream) => {
        if (!showPitchAnalysis) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();

            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;

            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            sourceRef.current = source;

            // Start pitch analysis
            startPitchAnalysis();

        } catch (error) {
            console.error('Error initializing audio analysis:', error);
        }
    };

    // Pitch Analysis Loop
    const startPitchAnalysis = () => {
        if (!analyserRef.current) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.fftSize;
        const dataArray = new Float32Array(bufferLength);

        const analyze = () => {
            if (!recording) return;

            analyser.getFloatTimeDomainData(dataArray);

            // Detect pitch using autocorrelation
            const pitch = detectPitch(dataArray, audioContextRef.current.sampleRate);
            if (pitch) {
                setCurrentPitch(Math.round(pitch));
            }

            // Analyze volume
            const volume = analyzeVolume(dataArray);
            setCurrentVolume(Math.round(volume * 100));

            // Draw waveform on canvas
            drawWaveform(dataArray);

            pitchAnalysisRef.current = requestAnimationFrame(analyze);
        };

        analyze();
    };

    // Draw waveform visualization
    const drawWaveform = (dataArray) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = 'rgb(20, 20, 20)';
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 255, 0)';
        ctx.beginPath();

        const sliceWidth = width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] * 0.5;
            const y = (v * height / 2) + height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.stroke();
    };

    // Stop pitch analysis
    const stopPitchAnalysis = () => {
        if (pitchAnalysisRef.current) {
            cancelAnimationFrame(pitchAnalysisRef.current);
        }

        if (sourceRef.current) {
            sourceRef.current.disconnect();
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }

        setCurrentPitch(null);
        setCurrentVolume(0);
    };

    const start = async () => {
        try {
            // Clear previous transcription and reset detection state
            resetTranscript();
            finalTranscriptRef.current = ''; // Clear the ref as well
            setDetectedLanguage(null);
            setIsAutoDetecting(autoDetectLanguage);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Initialize audio analysis
            initAudioAnalysis(stream);

            // Start speech recognition if available and enabled
            if (enableSpeechToText && browserSupportsSpeechRecognition) {
                try {
                    // Set language for speech recognition
                    const startLanguage = autoDetectLanguage ? defaultLanguage : selectedLanguage;
                    SpeechRecognition.getRecognition().lang = startLanguage;
                    SpeechRecognition.startListening({
                        continuous: true,
                        interimResults: true
                    });
                    console.log(`Speech recognition started for language: ${startLanguage}`);
                } catch (error) {
                    console.warn('Failed to start speech recognition:', error);
                }
            }

            // Use WebM for recording (better browser support)
            const mime =
                MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : '';

            const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
            mediaRef.current = { stream, recorder: rec, chunks: [] };

            rec.ondataavailable = e => {
                if (e.data && e.data.size > 0) mediaRef.current.chunks.push(e.data);
            };

            rec.onstop = async () => {
                try {
                    // Create WebM blob first
                    const blob = new Blob(mediaRef.current.chunks, { type: rec.mimeType || 'audio/webm' });
                    mediaRef.current.chunks = [];

                    const mb = (blob.size / (1024 * 1024)).toFixed(2);
                    if (fileTooLarge(blob, MAX_BYTES)) {
                        throw new Error(formatMessage({
                            id: "uploadFile.fileTooLarge",
                            defaultMessage: "File is too large (5MB). Please select a file ≤ 5MB."
                        }));
                    }

                    const dataType = await blobToDataType(blob);
                    const finalText = finalTranscriptRef.current.trim(); // Use ref instead of transcript state
                    onChange?.({
                        voice: dataType,
                        blob: blob,
                        transcription: finalText,
                        pitch: currentPitch,
                        language: detectedLanguage || selectedLanguage,
                        detectedLanguage: detectedLanguage,
                        wasAutoDetected: autoDetectLanguage && !!detectedLanguage
                    }, mb);
                } catch (error) {
                    addToast({
                        type: 'error',
                        icon: errorIcon,
                        message: formatMessage({
                            id: "global.errorMessage",
                            defaultMessage: "An error occurred. Please try again."
                        }),
                        dismissable: true,
                        timeout: 7000
                    });
                    // console.log(error.message)
                } finally {
                    stream.getTracks().forEach(t => t.stop());
                    stopPitchAnalysis();

                    // Stop speech recognition
                    if (enableSpeechToText) {
                        SpeechRecognition.stopListening();
                    }
                }
            };

            rec.start(100); // 100ms timeslice
            setRecording(true);
            startTimer();
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: formatMessage({
                    id: "global.micNotFound",
                    defaultMessage: "You cannot access the micro. Please grant permission."
                }),
                dismissable: true,
                timeout: 7000
            });
            // console.log(error.message)
        }
    };

    const stop = () => {
        const { recorder } = mediaRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }
        setRecording(false);
        stopTimer();
        stopPitchAnalysis();
        setIsAutoDetecting(false);

        // Stop speech recognition using the library
        if (enableSpeechToText) {
            SpeechRecognition.stopListening();
        }
    };

    // Language change effect (only when not auto-detecting)
    React.useEffect(() => {
        if (!autoDetectLanguage && recording && enableSpeechToText && browserSupportsSpeechRecognition) {
            // Change language for current recognition session
            try {
                SpeechRecognition.getRecognition().lang = selectedLanguage;
                console.log(`Changed speech recognition language to: ${selectedLanguage}`);
            } catch (error) {
                console.warn('Failed to change speech recognition language:', error);
            }
        }
    }, [selectedLanguage, autoDetectLanguage, recording, enableSpeechToText, browserSupportsSpeechRecognition]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            stopPitchAnalysis();
            if (enableSpeechToText) {
                SpeechRecognition.stopListening();
            }
        };
    }, [enableSpeechToText]);

    React.useEffect(() => {
        // tránh lỗi SSR
        if (typeof document === 'undefined' || !processingClass) return;

        const body = document.body;

        if (recording) {
            body.classList.add(processingClass);
        } else {
            body.classList.remove(processingClass);
        }

        // luôn cleanup khi unmount
        return () => body.classList.remove(processingClass);
    }, [recording]);

    return (
        <>
            <div className={absolute ? `${classes.root} ${classes.rootAbsolute}` : classes.root}>
                {!recording && (
                    <>
                        {showLanguageSelector && enableSpeechToText && !autoDetectLanguage && (
                            <div className={classes.languageSelector}>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className={classes.languageSelect}
                                    title="Select language for speech recognition"
                                >
                                    {languageOptions.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.flag} {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {autoDetectLanguage && enableSpeechToText && (
                            <div className={classes.autoDetectInfo}>
                                <span className={classes.autoDetectLabel}>
                                    🤖 Auto-detect: Vietnamese / English
                                </span>
                            </div>
                        )}
                        <button type='button' className={classes.voiceTrigger} onClick={start} title={formatMessage({ id: 'voice.trigger', defaultMessage: 'Microphone' })}>
                            <span>{label}</span>
                        </button>
                    </>
                )}
                {recording && (
                    <div className={classes.recordingContainer}>
                        <div className={classes.recordingHeader}>
                            <div className={classes.recordingIcon}>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            {enableSpeechToText && (
                                <div className={classes.currentLanguage}>
                                    {autoDetectLanguage ? (
                                        <>
                                            {isAutoDetecting ? (
                                                <span className={classes.detectingIndicator}>
                                                    🔍 Detecting language...
                                                </span>
                                            ) : detectedLanguage ? (
                                                <>
                                                    <span className={classes.detectedFlag}>
                                                        {languageOptions.find(lang => lang.code === detectedLanguage)?.flag}
                                                    </span>
                                                    <span className={classes.detectedLanguage}>
                                                        {languageOptions.find(lang => lang.code === detectedLanguage)?.name}
                                                    </span>
                                                    <span className={classes.autoDetectedBadge}>auto</span>
                                                </>
                                            ) : (
                                                <>
                                                    {languageOptions.find(lang => lang.code === selectedLanguage)?.flag}
                                                    {languageOptions.find(lang => lang.code === selectedLanguage)?.name}
                                                    <span className={classes.startingBadge}>starting...</span>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {languageOptions.find(lang => lang.code === selectedLanguage)?.flag}
                                            {languageOptions.find(lang => lang.code === selectedLanguage)?.name}
                                        </>
                                    )}
                                    {listening && <span className={classes.listeningIndicator}>🎯</span>}
                                </div>
                            )}
                        </div>
                        {showPitchAnalysis && (
                            <div className={classes.pitchDisplay}>
                                <div className={classes.pitchInfo}>
                                    {currentPitch && <span className={classes.pitchValue}>Pitch: {currentPitch} Hz</span>}
                                    <span className={classes.volumeValue}>Volume: {currentVolume}%</span>
                                    <span className={classes.recordingTime}>Time: {formatTime(elapsed)}</span>
                                </div>
                                <canvas
                                    ref={canvasRef}
                                    className={classes.waveformCanvas}
                                    width="300"
                                    height="100"
                                />
                            </div>
                        )}
                        {enableSpeechToText && (
                            <div className={classes.transcriptionContainer}>
                                <span className={classes.transcriptionLabel}>
                                    {(detectedLanguage || selectedLanguage).startsWith('vi') ? 'Phiên âm:' : 'Transcription:'}
                                </span>
                                <div className={classes.transcriptionText}>
                                    {transcript || (
                                        <span className={classes.transcriptionPlaceholder}>
                                            {isAutoDetecting ? (
                                                'Detecting language... / Đang nhận diện ngôn ngữ...'
                                            ) : listening ? (
                                                (detectedLanguage || selectedLanguage).startsWith('vi') ? 'Đang nghe...' : 'Listening...'
                                            ) : (
                                                (detectedLanguage || selectedLanguage).startsWith('vi') ? 'Bắt đầu nói...' : 'Start speaking...'
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {!!recording && (
                <button type='button' className={classes.voicePause} onClick={stop} title={formatMessage({ id: 'voice.stopTrigger', defaultMessage: 'Stop and Submit' })}>
                    <span>
                        {(detectedLanguage || selectedLanguage).startsWith('vi') ? 'Dừng' : 'Stop'}
                    </span>
                </button>
            )}
        </>
    );
}
export default VoiceTextField
