import React, { useState, useEffect } from 'react';
import styles from '../../styles.module.css';
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface EmbTextInputProps {
  initialValue: any;
  onChange: (value: any) => void;
  isInlineEditing: boolean;
}

const EmbTextInput: React.FC<EmbTextInputProps> = ({ initialValue, onChange, isInlineEditing }) => {
  const [embText, setEmbText] = useState({
    text: "",
    index: true,
    chunks: [] as string[],
    emb_model: "text-embedding-3-small",
    max_chunk_size: 1000,
    chunk_overlap: 200,
    is_separator_regex: false,
    separators: null as string[] | null,
    keep_separator: false
  });
  const [showAdvancedEmbSettings, setShowAdvancedEmbSettings] = useState(false);

  useEffect(() => {
    if (isInlineEditing && initialValue) {
      try {
        if (typeof initialValue === 'object' && initialValue !== null && initialValue['xText']) {
          const textValue = initialValue['xText'] || {};
          setEmbText({
            text: textValue.text || "",
            index: textValue.index !== undefined ? textValue.index : true,
            chunks: textValue.chunks || [],
            emb_model: textValue.emb_model || "text-embedding-3-small",
            max_chunk_size: textValue.max_chunk_size || 1000,
            chunk_overlap: textValue.chunk_overlap || 200,
            is_separator_regex: textValue.is_separator_regex || false,
            separators: textValue.separators || null,
            keep_separator: textValue.keep_separator || false
          });
        } else {
           // Handle case where initialValue might be a stringified version
           const parsed = JSON.parse(initialValue);
           if (parsed && parsed['xText']){
             const textValue = parsed['xText'];
             setEmbText({
               text: textValue.text || "",
               index: textValue.index !== undefined ? textValue.index : true,
               chunks: textValue.chunks || [],
               emb_model: textValue.emb_model || "text-embedding-3-small",
               max_chunk_size: textValue.max_chunk_size || 1000,
               chunk_overlap: textValue.chunk_overlap || 200,
               is_separator_regex: textValue.is_separator_regex || false,
               separators: textValue.separators || null,
               keep_separator: textValue.keep_separator || false
             });
           } else {
              setEmbText({
                text: "",
                index: true,
                chunks: [],
                emb_model: "text-embedding-3-small",
                max_chunk_size: 1000,
                chunk_overlap: 200,
                is_separator_regex: false,
                separators: null,
                keep_separator: false
              });
           }
        }
      } catch (e) {
        console.error("Failed to parse Text value during init:", e);
         setEmbText({
            text: typeof initialValue === 'string' ? initialValue : "", // Assume string if parsing fails
            index: true,
            chunks: [],
            emb_model: "text-embedding-3-small",
            max_chunk_size: 1000,
            chunk_overlap: 200,
            is_separator_regex: false,
            separators: null,
            keep_separator: false
          });
      }
    }
     else { // For Add mode
         setEmbText({
            text: "",
            index: true,
            chunks: [],
            emb_model: "text-embedding-3-small",
            max_chunk_size: 1000,
            chunk_overlap: 200,
            is_separator_regex: false,
            separators: null,
            keep_separator: false
          });
    }
  }, [isInlineEditing, initialValue]);

  const handleEmbTextChange = (field: string, value: any) => {
    const newEmbText = {
      ...embText,
      [field]: field === 'max_chunk_size' || field === 'chunk_overlap' ? Number(value) : 
               field === 'index' || field === 'is_separator_regex' || field === 'keep_separator' ? Boolean(value) :
               field === 'separators' ? (value ? value.split(',').map((s: string) => s.trim()) : null) :
               value
    };
    setEmbText(newEmbText);
    onChange(newEmbText); // Pass the whole object up
  };

  const toggleAdvancedSettings = () => {
    setShowAdvancedEmbSettings(!showAdvancedEmbSettings);
  };

  return (
    <div className={styles.embTextInputs}>
      <div className={styles.embTextField}>
        <label>Text:</label>
        <textarea
          value={embText.text}
          onChange={(e) => handleEmbTextChange('text', e.target.value)}
          className={styles.embTextArea}
          placeholder="Enter text to embed"
        />
      </div>
      
      <div className={styles.embTextField}>
        <label>
          <input
            type="checkbox"
            checked={embText.index}
            onChange={(e) => handleEmbTextChange('index', e.target.checked)}
          />
          Enable indexing for search
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
              value={embText.emb_model}
              onChange={(e) => handleEmbTextChange('emb_model', e.target.value)}
              className={styles.embModelSelector}
            >
              <option value="text-embedding-3-small">text-embedding-3-small</option>
              <option value="text-embedding-3-large">text-embedding-3-large</option>
              <option value="text-embedding-ada-002">text-embedding-ada-002</option>
            </select>
          </div>
          <div className={styles.embTextField}>
            <label>Max Chunk Size:</label>
            <input
              type="number"
              value={embText.max_chunk_size}
              onChange={(e) => handleEmbTextChange('max_chunk_size', Number(e.target.value))}
              className={styles.embTextInput}
            />
          </div>
          <div className={styles.embTextField}>
            <label>Chunk Overlap:</label>
            <input
              type="number"
              value={embText.chunk_overlap}
              onChange={(e) => handleEmbTextChange('chunk_overlap', Number(e.target.value))}
              className={styles.embTextInput}
            />
          </div>
          <div className={styles.embTextField}>
            <label>
              <input
                type="checkbox"
                checked={embText.is_separator_regex}
                onChange={(e) => handleEmbTextChange('is_separator_regex', e.target.checked)}
              />
              Use regex separators
            </label>
          </div>
          <div className={styles.embTextField}>
            <label>Separators (comma-separated):</label>
            <input
              type="text"
              value={embText.separators ? embText.separators.join(', ') : ''}
              onChange={(e) => handleEmbTextChange('separators', e.target.value)}
              className={styles.embTextInput}
              placeholder="e.g., \n\n, \n, ."
            />
          </div>
          <div className={styles.embTextField}>
            <label>
              <input
                type="checkbox"
                checked={embText.keep_separator}
                onChange={(e) => handleEmbTextChange('keep_separator', e.target.checked)}
              />
              Keep separators in chunks
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbTextInput; 