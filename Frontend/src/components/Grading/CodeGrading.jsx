import React, { useRef } from 'react';
import { Code, Upload, Zap } from 'lucide-react';

const CodeGrading = ({ 
  uploadedCode, 
  setUploadedCode, 
  onGradeCode, 
  loading 
}) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedCode(e.target.result);
        onGradeCode(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleGradeSubmit = () => {
    if (uploadedCode.trim()) {
      onGradeCode(uploadedCode);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Code className="w-5 h-5 mr-2 text-green-600" />
        Automated Code Grading
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Code File or Paste Code
          </label>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".py,.js,.java,.cpp,.c"
              className="hidden"
            />
          </div>
          
          <textarea
            value={uploadedCode}
            onChange={(e) => setUploadedCode(e.target.value)}
            placeholder="Paste student code here..."
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm code-editor"
          />
        </div>
        
        <button
          onClick={handleGradeSubmit}
          disabled={loading || !uploadedCode.trim()}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing Code...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Grade & Analyze</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeGrading;