import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const VoiceAssistant = ({ isOpen, onClose, onVoiceInput, onVoiceEvaluate, onVoiceClear }) => {
  const { playClickSound } = useTheme();
  
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setRecognizing(true);
        setTranscript('Listening...');
        setError(null);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processSpeech(text);
      };

      rec.onerror = (event) => {
        console.error('Speech error', event.error);
        setError(`Error: ${event.error}. Try again.`);
        setRecognizing(false);
      };

      rec.onend = () => {
        setRecognizing(false);
      };

      setRecognition(rec);
    } else {
      setError('Web Speech API is not supported in this browser. Try Chrome or Edge.');
    }
  }, []);

  const startListening = () => {
    playClickSound();
    if (recognition && !recognizing) {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Speech start error', e);
      }
    }
  };

  const stopListening = () => {
    playClickSound();
    if (recognition && recognizing) {
      recognition.stop();
    }
  };

  // Maps speaking variables to calculator symbols
  const processSpeech = (speech) => {
    let text = speech.toLowerCase();
    
    // Commands
    if (text.includes('calculate') || text.includes('equals') || text.includes('solve')) {
      // Evaluate what we have, but first process the rest of the text
      text = text.replace(/calculate|equals|solve/g, '');
      const parsed = parseSpeechToMath(text);
      if (parsed) onVoiceInput(parsed);
      setTimeout(() => onVoiceEvaluate(), 200);
      return;
    }

    if (text.includes('clear') || text.includes('reset')) {
      onVoiceClear();
      setTranscript('Cleared display');
      return;
    }

    const mathText = parseSpeechToMath(text);
    if (mathText) {
      onVoiceInput(mathText);
    } else {
      setTranscript(`Sorry, couldn't parse "${speech}" into math.`);
    }
  };

  const parseSpeechToMath = (speechText) => {
    let t = speechText;

    // Word substitutions
    t = t
      .replace(/plus/g, '+')
      .replace(/minus/g, '-')
      .replace(/times|multiplied by|multiply/g, '×')
      .replace(/divided by|divide/g, '÷')
      .replace(/percent of/g, '% of ')
      .replace(/percent/g, '%')
      .replace(/point/g, '.')
      .replace(/open bracket|open parenthesis/g, '(')
      .replace(/close bracket|close parenthesis/g, ')')
      .replace(/modulus|mod/g, ' mod ');

    // Match patterns like "square root of 169" -> "sqrt(169)"
    const sqrtRegex = /square root of (\d+(\.\d+)?)/i;
    t = t.replace(sqrtRegex, 'sqrt($1)');

    // Match patterns like "cube root of 27" -> "cbrt(27)"
    const cbrtRegex = /cube root of (\d+(\.\d+)?)/i;
    t = t.replace(cbrtRegex, 'cbrt($1)');

    // Match patterns like "sin of 90", "sine of 90" -> "sin(90)"
    const sinRegex = /(sin|sine) of (\d+(\.\d+)?)/i;
    t = t.replace(sinRegex, 'sin($2)');

    // Match patterns like "cos of 90", "cosine of 90" -> "cos(90)"
    const cosRegex = /(cos|cosine) of (\d+(\.\d+)?)/i;
    t = t.replace(cosRegex, 'cos($2)');

    // Match patterns like "tan of 45", "tangent of 45" -> "tan(45)"
    const tanRegex = /(tan|tangent) of (\d+(\.\d+)?)/i;
    t = t.replace(tanRegex, 'tan($2)');

    // Match patterns like "square of 9" -> "9^2"
    const squareRegex = /square of (\d+(\.\d+)?)/i;
    t = t.replace(squareRegex, '($1)^2');

    // Clean remaining spaces and non-mathematical words
    // Allow only digits, operators, brackets, percentage, spaces, sqrt, cbrt, sin, cos, tan
    return t.replace(/[^\d+\-*/().% ×÷^a-zA-Z]/g, '').trim();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="glass-card" style={{
        width: '90%',
        maxWidth: '400px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={() => { playClickSound(); onClose(); }}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}>Speak Mathematical Formula</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          "25 plus 45" | "square root of 169" | "15 percent of 900"
        </p>

        {/* Pulsing Voice Circle */}
        <div 
          onClick={recognizing ? stopListening : startListening}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: recognizing ? 'var(--key-clear-bg)' : 'var(--key-op-bg)',
            border: `2px solid ${recognizing ? 'var(--key-clear-color)' : 'var(--key-op-color)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }}
          className={recognizing ? 'animate-pulse' : 'hover:scale-105'}
        >
          {recognizing ? (
            <>
              {/* Pulsing waves */}
              <div style={{
                position: 'absolute',
                width: '130%',
                height: '130%',
                border: '1px solid var(--key-clear-color)',
                borderRadius: '50%',
                opacity: 0.3,
                animation: 'ripple-animation 1.5s infinite linear'
              }}></div>
              <MicOff className="text-red-400" size={32} />
            </>
          ) : (
            <Mic className="text-blue-400" size={32} />
          )}
        </div>

        {/* Listening Status Text */}
        <div style={{ minHeight: '60px', width: '100%' }}>
          <p style={{
            fontSize: '0.95rem',
            fontStyle: recognizing ? 'italic' : 'normal',
            color: recognizing ? 'var(--text-primary)' : 'var(--text-secondary)',
            wordBreak: 'break-word',
            background: 'rgba(0,0,0,0.15)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid var(--card-border)'
          }}>
            {transcript || 'Click the mic and start speaking...'}
          </p>
        </div>

        {error && (
          <div style={{ color: '#f87171', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            {error}
          </div>
        )}

        <button
          className="header-btn w-full"
          onClick={recognizing ? stopListening : startListening}
          style={{ justifyContent: 'center', padding: '10px 0' }}
        >
          {recognizing ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
    </div>
  );
};
