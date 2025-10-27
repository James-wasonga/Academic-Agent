import React, { useState } from 'react';
import CodeGrading from './CodeGrading';
import GradingResults from './GradingResults';
import { useGrading } from '../../hooks/useGrading';
import Toast from '../Toast/Toast';

const Grading = () => {
  const [uploadedCode, setUploadedCode] = useState('');
  const [toast, setToast] = useState(null);
  const { loading, gradingResults, gradeCode } = useGrading();

  const handleCodeGrading = async (code) => {
     try{
    await gradeCode(code, 'python');
    // show success grading
    setToast({
      type: 'success',
      message: '🎉Grading completed successfully!, Your results are ready'
    })
    } catch(e) {
      //show error
      setToast({
        type: 'error',
        message: `🚨Error: ${e.message}`
      })
     }
  };

  //close toast
  const closeToast = () => {
    setToast(null);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={4000}
        />
        )}

      <CodeGrading
        uploadedCode={uploadedCode}
        setUploadedCode={setUploadedCode}
        onGradeCode={handleCodeGrading}
        loading={loading}
      />
      <GradingResults gradingResults={gradingResults} />
    </div>
  );
};

export default Grading;