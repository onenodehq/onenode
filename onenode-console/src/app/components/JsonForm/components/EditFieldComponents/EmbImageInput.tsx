import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../../styles.module.css';
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface EmbImageInputProps {
  initialValue: any;
  onChange: (value: any) => void; // Will pass { data: File | null, emb_model: string, ... } 
  isInlineEditing: boolean;
}

// Helper function (can be moved to a utils file later)
const determineImageType = (base64Data: string): string | null => {
  if (!base64Data) return null;
  if (base64Data.startsWith('/9j/')) return 'image/jpeg';
  if (base64Data.startsWith('iVBORw0KGg')) return 'image/png';
  if (base64Data.startsWith('R0lGOD')) return 'image/gif';
  if (base64Data.startsWith('UklGR')) return 'image/webp';
  if (base64Data.startsWith('PHN2Zy')) return 'image/svg+xml';
  return null;
};

const EmbImageInput: React.FC<EmbImageInputProps> = ({ initialValue, onChange, isInlineEditing }) => {
  const [embImage, setEmbImage] = useState({
    data: null as File | null,
    mime_type: "",
    index: true,
    chunks: [] as string[],
    emb_model: "text-embedding-3-small",
    vision_model: "gpt-4o-mini",
    max_chunk_size: 1000,
    chunk_overlap: 200,
    is_separator_regex: false,
    separators: null as string[] | null,
    keep_separator: false
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAdvancedEmbSettings, setShowAdvancedEmbSettings] = useState(false);

  useEffect(() => {
    if (isInlineEditing && initialValue) {
      try {
        if (typeof initialValue === 'object' && initialValue !== null && initialValue['xImage']) {
          const imageValue = initialValue['xImage'] || {};
          setEmbImage({
            data: null, // Can't recover file object
            mime_type: imageValue.mime_type || "",
            index: imageValue.index !== undefined ? imageValue.index : true,
            chunks: imageValue.chunks || [],
            emb_model: imageValue.emb_model || "text-embedding-3-small",
            vision_model: imageValue.vision_model || "gpt-4o-mini",
            max_chunk_size: imageValue.max_chunk_size || 1000,
            chunk_overlap: imageValue.chunk_overlap || 200,
            is_separator_regex: imageValue.is_separator_regex || false,
            separators: imageValue.separators || null,
            keep_separator: imageValue.keep_separator || false
          });
          if (imageValue.data) {
            const contentType = imageValue.mime_type || determineImageType(imageValue.data) || 'image/jpeg';
            setImagePreview(`data:${contentType};base64,${imageValue.data}`);
          }
        } else {
          // Handle case where initialValue might be a stringified version
           const parsed = JSON.parse(initialValue);
           if (parsed && parsed['xImage']){
              const imageValue = parsed['xImage'] || {};
              setEmbImage({
                data: null,
                mime_type: imageValue.mime_type || "",
                index: imageValue.index !== undefined ? imageValue.index : true,
                chunks: imageValue.chunks || [],
                emb_model: imageValue.emb_model || "text-embedding-3-small",
                vision_model: imageValue.vision_model || "gpt-4o-mini",
                max_chunk_size: imageValue.max_chunk_size || 1000,
                chunk_overlap: imageValue.chunk_overlap || 200,
                is_separator_regex: imageValue.is_separator_regex || false,
                separators: imageValue.separators || null,
                keep_separator: imageValue.keep_separator || false
              });
              if (imageValue.data) {
                const contentType = imageValue.mime_type || determineImageType(imageValue.data) || 'image/jpeg';
                setImagePreview(`data:${contentType};base64,${imageValue.data}`);
              }
           } else {
              setEmbImage({
                data: null,
                mime_type: "",
                index: true,
                chunks: [],
                emb_model: "text-embedding-3-small",
                vision_model: "gpt-4o-mini",
                max_chunk_size: 1000,
                chunk_overlap: 200,
                is_separator_regex: false,
                separators: null,
                keep_separator: false
              });
              setImagePreview(null);
           }
        }
      } catch (e) {
        console.error("Failed to parse Image value during init:", e);
         setEmbImage({
            data: null,
            mime_type: "",
            index: true,
            chunks: [],
            emb_model: "text-embedding-3-small",
            vision_model: "gpt-4o-mini",
            max_chunk_size: 1000,
            chunk_overlap: 200,
            is_separator_regex: false,
            separators: null,
            keep_separator: false
          });
           setImagePreview(null);
      }
    } else { // For Add mode
         setEmbImage({
            data: null,
            mime_type: "",
            index: true,
            chunks: [],
            emb_model: "text-embedding-3-small",
            vision_model: "gpt-4o-mini",
            max_chunk_size: 1000,
            chunk_overlap: 200,
            is_separator_regex: false,
            separators: null,
            keep_separator: false
          });
          setImagePreview(null);
    }
  }, [isInlineEditing, initialValue]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      if (event.target?.result) {
        const base64data = event.target.result as string;
        const newEmbImage = {
          ...embImage,
          data: file, // Store the actual File object
          mime_type: file.type
        };
        setEmbImage(newEmbImage);
        setImagePreview(base64data); // Set preview
        onChange(newEmbImage); // Pass updated object up
      }
    };
    fileReader.readAsDataURL(file);
     // Reset file input to allow uploading the same file again
    e.target.value = ''
  };

  const handleEmbImageChange = (field: string, value: any) => {
    const newEmbImage = {
      ...embImage,
      [field]: field === 'max_chunk_size' || field === 'chunk_overlap' ? Number(value) : 
               field === 'index' || field === 'is_separator_regex' || field === 'keep_separator' ? Boolean(value) :
               field === 'separators' ? (value ? value.split(',').map((s: string) => s.trim()) : null) :
               value
    };
    setEmbImage(newEmbImage);
    onChange(newEmbImage); // Pass updated object up
  };

  const toggleAdvancedSettings = () => {
    setShowAdvancedEmbSettings(!showAdvancedEmbSettings);
  };

  return (
    <div className={styles.embTextInputs}> {/* Reuse style for layout */}
      <div className={styles.embTextField}>
        <label>Image:</label>
        <div className={styles.fileUploadContainer}>
          <label className={styles.fileInput}>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              className={styles.hiddenFileInput}
            />
            {imagePreview ? "Change image" : "Choose image"}
          </label>
          {imagePreview && (
            <div className={styles.imagePreviewContainer}>
              <Image 
                src={imagePreview} 
                alt="Preview" 
                className={styles.imagePreview}
                width={200}
                height={200}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.embTextField}>
        <label>
          <input
            type="checkbox"
            checked={embImage.index}
            onChange={(e) => handleEmbImageChange('index', e.target.checked)}
          />
          Enable vision processing and indexing
        </label>
      </div>
      
      <button 
        type="button"
        onClick={toggleAdvancedSettings}
        className={`${styles.advancedSettingsToggle} ${showAdvancedEmbSettings ? styles.open : ''}`}
      >
        {showAdvancedEmbSettings ? 
          <ChevronDownIcon className="w-3 h-3" /> : 
          <ChevronRightIcon className="w-3 h-3" />
        }
        <span>{showAdvancedEmbSettings ? "Hide advanced settings" : "Show advanced settings"}</span>
      </button>
      
      {showAdvancedEmbSettings && (
        <div className={styles.advancedSettingsContainer}>
          <div className={styles.embTextField}>
            <label>Embedding Model:</label>
            <select
              value={embImage.emb_model}
              onChange={(e) => handleEmbImageChange('emb_model', e.target.value)}
              className={styles.embModelSelector}
            >
              <option value="text-embedding-3-small">text-embedding-3-small</option>
              <option value="text-embedding-3-large">text-embedding-3-large</option>
              <option value="text-embedding-ada-002">text-embedding-ada-002</option>
            </select>
          </div>
          <div className={styles.embTextField}>
            <label>Vision Model:</label>
            <select
              value={embImage.vision_model}
              onChange={(e) => handleEmbImageChange('vision_model', e.target.value)}
              className={styles.embModelSelector}
            >
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="o1">o1</option>
            </select>
          </div>
          <div className={styles.embTextField}>
            <label>Max Chunk Size:</label>
            <input
              type="number"
              value={embImage.max_chunk_size}
              onChange={(e) => handleEmbImageChange('max_chunk_size', Number(e.target.value))}
              className={styles.embTextInput}
            />
          </div>
          <div className={styles.embTextField}>
            <label>Chunk Overlap:</label>
            <input
              type="number"
              value={embImage.chunk_overlap}
              onChange={(e) => handleEmbImageChange('chunk_overlap', Number(e.target.value))}
              className={styles.embTextInput}
            />
          </div>
          <div className={styles.embTextField}>
            <label>
              <input
                type="checkbox"
                checked={embImage.is_separator_regex}
                onChange={(e) => handleEmbImageChange('is_separator_regex', e.target.checked)}
              />
              Use regex separators
            </label>
          </div>
          <div className={styles.embTextField}>
            <label>Separators (comma-separated):</label>
            <input
              type="text"
              value={embImage.separators ? embImage.separators.join(', ') : ''}
              onChange={(e) => handleEmbImageChange('separators', e.target.value)}
              className={styles.embTextInput}
              placeholder="e.g., \n\n, \n, ."
            />
          </div>
          <div className={styles.embTextField}>
            <label>
              <input
                type="checkbox"
                checked={embImage.keep_separator}
                onChange={(e) => handleEmbImageChange('keep_separator', e.target.checked)}
              />
              Keep separators in chunks
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbImageInput; 