import React, { useRef, useState, useEffect } from 'react';
import { Code, Upload, Zap, Eye, EyeOff } from 'lucide-react';

const CodeGrading = ({ 
  uploadedCode, 
  setUploadedCode, 
  onGradeCode, 
  loading 
}) => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

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

  // Auto-resize textarea and sync line numbers height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [uploadedCode]);

  // Keep line number column scroll synced with textarea scroll
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (!textarea || !lineNumbers) return;

    const syncScroll = () => {
      lineNumbers.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener('scroll', syncScroll);
    return () => textarea.removeEventListener('scroll', syncScroll);
  }, []);

  const lineNumbers = uploadedCode.split('\n').map((_, i) => i + 1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Code className="w-5 h-5 mr-2 text-green-600" />
        Automated Code Grading
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload Code File or Paste Code
            </label>
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
            >
              {showLineNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showLineNumbers ? 'Hide' : 'Show'} Line Numbers</span>
            </button>
          </div>

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
              accept=".py,.js,.java,.cpp,.c,.html,.css"
              className="hidden"
            />
          </div>

          {/* Code Editor */}
          <div className="relative border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex">
              {/* Line Numbers */}
              {showLineNumbers && (
                <div
                  ref={lineNumbersRef}
                  className="bg-gray-50 px-3 py-3 border-r border-gray-300 select-none overflow-hidden"
                  style={{ textAlign: 'right' }}
                >
                  <div className="font-mono text-sm text-gray-500 leading-6">
                    {lineNumbers.map((line) => (
                      <div key={line} className="min-w-[2rem]">{line}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Textarea */}
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={uploadedCode}
                  onChange={(e) => setUploadedCode(e.target.value)}
                  placeholder="Paste student code here..."
                  className={`w-full px-4 py-3 border-0 focus:ring-2 focus:ring-green-500 font-mono text-sm resize-none leading-6 ${
                    showLineNumbers ? 'pl-2' : ''
                  }`}
                  style={{
                    outline: 'none',
                    minHeight: '16rem',
                    lineHeight: '1.5rem',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Code Statistics */}
          {uploadedCode && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Lines: {uploadedCode.split('\n').length}</span>
              <span>Characters: {uploadedCode.length}</span>
              <span>Words: {uploadedCode.trim() ? uploadedCode.trim().split(/\s+/).length : 0}</span>
            </div>
          )}
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
