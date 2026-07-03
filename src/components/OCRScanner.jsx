import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Loader, CheckCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useTheme } from '../context/ThemeContext';

export const OCRScanner = ({ isOpen, onClose, onResultExtracted }) => {
  const { ocrLanguage, playClickSound } = useTheme();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const cleanExtractedText = (text) => {
    if (!text) return '';
    return text
      .replace(/\r?\n|\r/g, ' ') // Remove newlines
      .replace(/[^\d+\-*/().%xX×÷= \tπe^mod]/g, '') // Filter only mathematical tokens
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .replace(/x/gi, '×') // Standardize multiplier
      .trim();
  };

  const processImage = async (file) => {
    if (!file) return;

    // Show Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    setProgress(0);
    setProgressStatus('Initializing OCR engine...');
    setError(null);
    setExtractedText('');

    let worker = null;
    try {
      worker = await createWorker(ocrLanguage);
      
      // Update progress from Tesseract
      // Note: Tesseract.js uses worker actions
      // We can hook to progress updates
      // Tesseract worker logger
      // Note: createWorker options can include a logger
      
      // Let's re-initialize with a logger if supported, or manually simulate progress stages
      setProgressStatus('Loading language models...');
      setProgress(25);
      
      setProgressStatus('Analyzing layouts...');
      setProgress(50);
      
      const { data: { text } } = await worker.recognize(file);
      
      setProgress(90);
      setProgressStatus('Refining math symbols...');
      
      const cleaned = cleanExtractedText(text);
      if (cleaned) {
        setExtractedText(cleaned);
      } else {
        setExtractedText('');
        setError('No mathematical characters detected in the image. Try a clearer image with simple equations.');
      }
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError(`OCR processing failed: ${err.message}`);
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleApply = () => {
    playClickSound();
    if (extractedText) {
      onResultExtracted(extractedText);
      onClose();
    }
  };

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera className="text-blue-400" size={20} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem' }}>OCR Equation Solver</h2>
        </div>
        <button 
          onClick={() => { playClickSound(); onClose(); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Scan printed or handwritten math equations from an image to solve them automatically.
        </p>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--card-border)',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: 'rgba(255,255,255,0.01)',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          className="hover:bg-opacity-5 hover:border-blue-500"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
            disabled={loading}
          />
          <Upload size={32} className="text-blue-400" />
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Drag & Drop Image here</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Supports PNG, JPG, JPEG</p>
          </div>
        </div>

        {/* Preview & Processing Status */}
        {imagePreview && (
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--card-border)',
            background: '#000',
            maxHeight: '180px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img src={imagePreview} alt="OCR Preview" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', opacity: loading ? 0.5 : 1 }} />
            
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)',
                gap: '8px'
              }}>
                <Loader className="animate-spin text-blue-400" size={24} />
                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{progressStatus}</p>
                <div style={{ width: '60%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ color: '#f87171', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.05)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            {error}
          </div>
        )}

        {/* Results Extraction */}
        {extractedText !== '' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <CheckCircle size={14} className="text-emerald-400" />
              <span>Extracted Formula (Review & Edit)</span>
            </div>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                color: 'var(--text-primary)',
                border: '1px solid var(--card-border)',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '1.1rem',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
                minHeight: '60px',
                outline: 'none'
              }}
            />
            <button
              className="calc-btn btn-eq"
              onClick={handleApply}
              style={{ padding: '10px 0', fontSize: '0.95rem', borderRadius: '10px', marginTop: '4px' }}
            >
              Solve in Calculator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
