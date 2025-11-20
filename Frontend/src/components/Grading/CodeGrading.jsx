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
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  // Auto detect language from code context 

  const detectLanguage = (code) => {

    if (!code.trim()) return 'python';

    // HTML Detection
    if (/<[a-z][\s\S]*>/i.test(code) || /<!DOCTYPE/i.test(code)) {
      return 'html';
    }

    // CSS Detection
    if (/\{[^}]*:[^}]*\}/.test(code) && /@media|\.[\w-]+\s*\{|#[\w-]+\s*\{/.test(code)) {
      return 'css';
    }

    // Javascript Detection
    if (/\b(const|var|let|function|=>|console\.log)\b/.test(code)) {
      return 'javascript';
    }

    // Java Detection
    if (/\b(public|private|protected)\s+(static\s+)?(void|int|String|class)\b/.test(code)) {
      return 'java';
    }

    // C++ Detection
    if (/#include|using namespace std|std::cout|cin/.test(code)) {
      return 'cpp';
    }

    // C Detection
    if (/#include|printf|scanf|int main/.test(code) && !/cout|cin|namespace/.test(code)) {
      return 'c';
    }

    // python default 
    if (/\b(def|import|from|class|def|if|else|for|while|try|print|return)\b/.test(code)) {
      return 'python';
    }

    return selectedLanguage;

  }



const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Detect language from file extension
    const extension = file.name.split('.').pop().toLowerCase();
    const languageMap = {
      'py': 'python',
      'js': 'javascript',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c': 'c',
      'html': 'html',
      'htm': 'html',
      'css': 'css'
    };
    
    const detectedLang = languageMap[extension] || 'python';
    setSelectedLanguage(detectedLang);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedCode(e.target.result);
    };
    reader.readAsText(file);
  }
};

const handleCodeChange = (e) => {
  const code = e.target.value;
  setUploadedCode(code);
  
  // Auto-detect language when user types
  const detected = detectLanguage(code);
  if (detected !== selectedLanguage) {
    setSelectedLanguage(detected);
  }
};

const handleGradeSubmit = () => {
  if (uploadedCode.trim()) {
    // Pass the selected language to the grading function
    onGradeCode(uploadedCode, selectedLanguage);
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

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' }
];

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

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
          
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-blue-700 font-bold"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          
          <div className="flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <span className="text-blue-700">
              Detected: <span className="font-bold text-blue-600">{languages.find(l => l.value === selectedLanguage)?.label}</span>
            </span>
          </div>
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
                onChange={handleCodeChange}
                placeholder="Paste your code here..."
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
