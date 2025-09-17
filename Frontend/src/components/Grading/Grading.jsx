import React, { useState } from 'react';
import CodeGrading from './CodeGrading';
import GradingResults from './GradingResults';
import { useGrading } from '../../hooks/useGrading';

const Grading = () => {
  const [uploadedCode, setUploadedCode] = useState('');
  const { loading, gradingResults, gradeCode } = useGrading();

  const handleCodeGrading = async (code) => {
    await gradeCode(code, 'python');
  };

  return (
    <div className="space-y-6">
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