import { useRef } from 'react';

export default function DataControls({ onExport, onImport }) {
  const fileRef = useRef();

  return (
    <div className="data-controls">
      <button className="data-btn" onClick={onExport}>Export Data</button>
      <button className="data-btn" onClick={() => fileRef.current.click()}>Import Data</button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onImport(e.target.files[0]); }}
      />
    </div>
  );
}
