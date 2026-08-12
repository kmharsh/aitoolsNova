import { memo } from 'react';
import '../../styles/components/UploadSection.css';

interface UploadSectionProps {
  onDirectCompare: (files: FileList) => void;
  onSimulateDocument: (file: File) => void;
}

export const UploadSection = memo(({ onDirectCompare, onSimulateDocument }: UploadSectionProps) => {
  return (
    <div className="upload-section">
      <label className="interactive-btn upload-btn-direct">
        Direct Compare
        <input 
          type="file" 
          multiple
          style={{ display: 'none' }} 
          onChange={(e) => {
            if (e.target.files) {
              onDirectCompare(e.target.files);
              e.target.value = '';
            }
          }}
        />
      </label>
      
      <label className="interactive-btn upload-btn-simulate">
        Upload File
        <input 
          type="file" 
          style={{ display: 'none' }} 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const file = e.target.files[0];
              onSimulateDocument(file);
              e.target.value = '';
            }
          }}
        />
      </label>
    </div>
  );
});
