import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, File, AlertCircle, Loader } from 'lucide-react';
import client from '../api/client';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string; // Uploaded URL
  onChange: (url: string) => void;
  required?: boolean;
  type?: 'image' | 'document' | 'any';
}

export default function FileUpload({
  label,
  accept = '.jpg,.jpeg,.png,.webp,.pdf',
  maxSizeMB = 5,
  value = '',
  onChange,
  required = false,
  type = 'any',
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal preview with external value
  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Optimize and compress images client-side using Canvas
  const optimizeImage = (imageFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          // Resize if exceeding max dimensions
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(imageFile); // Fallback to original
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Export as optimized JPEG at 80% quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(imageFile);
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for optimization'));
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
    });
  };

  const processFile = async (selectedFile: File) => {
    setError('');
    setProgress(0);

    // Validate size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size allowed is ${maxSizeMB}MB.`);
      return;
    }

    // Validate extension
    const extension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase());
    if (!allowedExtensions.includes(extension) && accept !== '*') {
      setError(`Invalid file type. Allowed types: ${accept}`);
      return;
    }

    setFile(selectedFile);
    
    // Set immediate client-side preview
    if (selectedFile.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(''); // Document preview icon handled separately
    }

    // Perform upload
    try {
      setUploading(true);
      const formData = new FormData();
      
      let uploadPayload: Blob = selectedFile;
      let filename = selectedFile.name;

      // Optimize image if applicable
      if (selectedFile.type.startsWith('image/') && type !== 'document') {
        try {
          uploadPayload = await optimizeImage(selectedFile);
          // Rename optimized image extension to .jpg
          filename = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) + '-optimized.jpg';
        } catch (optimizeErr) {
          console.warn('Image optimization failed, uploading original:', optimizeErr);
        }
      }

      formData.append('file', uploadPayload, filename);

      const response = await client.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentage);
          }
        },
      });

      if (response.data.success) {
        onChange(response.data.url);
        if (!selectedFile.type.startsWith('image/')) {
          setPreviewUrl(response.data.url); // Set the URL for docs
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || err.message || 'File upload failed. Please try again.');
      setFile(null);
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl('');
    setProgress(0);
    setError('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isPdf = previewUrl?.endsWith('.pdf') || file?.type === 'application/pdf';

  return (
    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      <label className="form-label">
        {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </label>

      {/* Upload/Preview Box */}
      {previewUrl ? (
        <div 
          className="glass-card" 
          style={{ 
            position: 'relative', 
            padding: 'var(--space-md)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-md)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}
        >
          {/* Preview Image/Doc Icon */}
          {isPdf ? (
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: 'var(--radius-sm)', 
                background: 'rgba(239, 68, 68, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <File size={32} />
            </div>
          ) : previewUrl.startsWith('blob:') || previewUrl.startsWith('http') ? (
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ 
                width: '64px', 
                height: '64px', 
                objectFit: 'cover', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)'
              }} 
            />
          ) : (
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--bg-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <File size={32} />
            </div>
          )}

          {/* Details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {file ? file.name : previewUrl.substring(previewUrl.lastIndexOf('/') + 1)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Cloud hosted file'}
            </span>
          </div>

          {/* Delete action */}
          <button
            type="button"
            onClick={removeFile}
            className="btn btn-ghost btn-sm"
            style={{ 
              color: 'var(--color-danger)', 
              padding: '6px', 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.08)' 
            }}
            title="Delete & Replace"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Drag-and-drop zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragOver ? '2px dashed var(--accent-cyan)' : '2px dashed var(--border-default)',
            background: isDragOver ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255, 255, 255, 0.01)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-xl) var(--space-md)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
          className="glass-card-hover"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={accept}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Loader className="spin" size={32} color="var(--accent-cyan)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Uploading file... {progress}%</span>
              {/* Progress Bar */}
              <div 
                style={{ 
                  width: '180px', 
                  height: '6px', 
                  background: 'var(--border-default)', 
                  borderRadius: '3px', 
                  overflow: 'hidden' 
                }}
              >
                <div 
                  style={{ 
                    width: `${progress}%`, 
                    height: '100%', 
                    background: 'var(--accent-cyan)', 
                    transition: 'width 0.1s ease' 
                  }} 
                />
              </div>
            </div>
          ) : (
            <>
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: '50%', 
                  padding: '10px', 
                  color: 'var(--text-secondary)' 
                }}
              >
                <Upload size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Drag & drop file here, or <span style={{ color: 'var(--accent-cyan)' }}>browse</span>
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Supports {accept} (Max {maxSizeMB}MB)
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)', fontSize: '12px', marginTop: '2px' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
