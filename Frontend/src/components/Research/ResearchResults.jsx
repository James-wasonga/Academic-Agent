// import React from 'react';
// import { Save, Download } from 'lucide-react';

// const ResearchResults = ({ results }) => {
//   if (!results) return null;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-gray-900">Research Results</h3>
//         <div className="flex space-x-2">
//           <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
//             <Save className="w-4 h-4" />
//             <span>Save</span>
//           </button>
//           <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
//             <Download className="w-4 h-4" />
//             <span>Export</span>
//           </button>
//         </div>
//       </div>
      
//       <div className="space-y-4">
//         <div>
//           <h4 className="font-medium text-gray-900 mb-2">Topic: {results.topic}</h4>
//           <p className="text-gray-700 leading-relaxed">{results.summary}</p>
//         </div>
        
//         <div>
//           <h4 className="font-medium text-gray-900 mb-2">Sources</h4>
//           <p className="text-gray-600 text-sm">{results.sources}</p>
//         </div>
        
//         <div className="flex items-center space-x-4 text-sm text-gray-500">
//           <span>Tools used: {results.tool_used.join(', ')}</span>
//           <span>•</span>
//           <span>Generated: {results.timestamp}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResearchResults;

// import React from 'react';
// import { Save, Download } from 'lucide-react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

// const ResearchResults = ({ results }) => {
//   if (!results) return null;

//   return (
//     <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn space-y-6">
//       {/* Header Section */}
//       <div className="flex items-center justify-between border-b border-gray-200 pb-3">
//         <h3 className="text-2xl font-bold text-gray-900">Research Results</h3>
//         <div className="flex space-x-3">
//           <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
//             <Save className="w-4 h-4" />
//             <span>Save</span>
//           </button>
//           <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
//             <Download className="w-4 h-4" />
//             <span>Export</span>
//           </button>
//         </div>
//       </div>

//       {/* Topic Section */}
//       <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//         <h4 className="text-xl font-semibold text-gray-800 mb-1">
//           📌 Topic: <span className="font-bold">{results.topic}</span>
//         </h4>
//       </div>

//       {/* Research Summary - Render as Markdown */}
//       <div className="prose max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-indigo-700">
//         <ReactMarkdown remarkPlugins={[remarkGfm]}>
//           {results.summary}
//         </ReactMarkdown>
//       </div>

//       {/* Sources Section */}
//       <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//         <h4 className="font-semibold text-gray-800 mb-2">📚 Sources</h4>
//         <p className="text-gray-700 text-sm">{results.sources}</p>
//       </div>

//       {/* Footer */}
//       <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
//         <span>Tools used: {results.tool_used.join(', ')}</span>
//         <span>Generated: {new Date(results.timestamp).toLocaleString()}</span>
//       </div>
//     </div>
//   );
// };

// export default ResearchResults;

/// ACTUAL CODE STARTS HERE

import React from "react";
import { Save, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";

const cleanMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s*/gm, "") // remove all # headings
    .replace(/[-*]\s*(\d+\.\s)/g, "$1") // Remove bullets before numbered lines
    .replace(/^\*\s+/gm, "- ") // Convert * to dash lists
    .replace(/\*\*/g, "") // remove bold markers
    .replace(/\*/g, ""); // Remove stray *
};

// Component to bold numbered headings on-screen
const NumberedHeading = ({ children }) => {
  const text = children?.[0] || "";
  const isNumberedHeading = /^\d+(\.\d+)*\.\s+/.test(text);
  return (
    <p className={`mb-4 leading-relaxed ${isNumberedHeading ? "font-bold" : ""}`}>
      {children}
    </p>
  );
};

const ResearchResults = ({ results }) => {
  if (!results) return null;

  const cleanedSummary = cleanMarkdown(results.summary);

  const handleExport = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Research Results", 40, y);
    y += 30;

    // Topic
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Topic: ${results.topic}`, 40, y);
    y += 25;

    // Content
    const lines = cleanedSummary.split("\n");
    doc.setFontSize(12);

    lines.forEach((line) => {
      if (!line.trim()) {
        y += 8; // spacing for blank lines
        return;
      }

      // Bold numbered headings
      if (/^\d+(\.\d+)*\.\s+/.test(line)) {
        doc.setFont("Helvetica", "bold");
      } else {
        doc.setFont("Helvetica", "normal");
      }

      // Bullet points
      if (/^\-\s+/.test(line)) {
        line = "• " + line.replace(/^\-\s+/, "");
      }

      const wrappedLines = doc.splitTextToSize(line, 500);
      wrappedLines.forEach((t) => {
        if (y > 770) {
          doc.addPage();
          y = 40;
        }
        doc.text(t, 40, y);
        y += 16;
      });
    });

    // Sources
    if (results.sources) {
      y += 20;
      if (y > 770) {
        doc.addPage();
        y = 40;
      }
      doc.setFont("Helvetica", "bold");
      doc.text("Sources:", 40, y);
      y += 16;

      doc.setFont("Helvetica", "normal");
      const sourceLines = doc.splitTextToSize(results.sources, 500);
      sourceLines.forEach((t) => {
        if (y > 770) {
          doc.addPage();
          y = 40;
        }
        doc.text(t, 40, y);
        y += 14;
      });
    }

    doc.save(`${results.topic.replace(/\s+/g, "_")}_Research.pdf`);
  };

    /* ---------------------------
     Save MD/TXT export
     --------------------------- */
     const handleSaveMarkdown = () => {
      const md = [
        `# Research Results`,
        ``,
        `**Topic:** ${results.topic || ""}`,
        ``,
        `**Generated On:** ${results.timestamp || new Date().toLocaleString()}`,
        ``,
        `**Tools:** ${Array.isArray(results.tool_used) ? results.tool_used.join(", ") : results.tool_used || ""}`,
        ``,
        `## Content:`,
        "",
        cleanedSummary,
        "",
        `## Sources:`,
        "",
        Array.isArray(results.sources) ? results.sources.join("\n") : (results.sources || ""),
      ].join("\n");
  
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ResearchResults_${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 className="text-3xl font-bold text-gray-900">Research Results</h3>
        <div className="flex space-x-4">
          <button onClick={handleSaveMarkdown} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors" title="Save as Markdown">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Topic */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-xl font-semibold text-gray-800">
           Topic: <span className="font-bold">{results.topic}</span>
        </h4>
      </div>

      {/* Markdown Renderer */}
      <div className="markdown-content prose prose-lg max-w-none prose-headings:font-bold prose-p:leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: NumberedHeading,
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside ml-5 mb-4 space-y-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside ml-5 mb-4 space-y-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed text-gray-800" {...props} />
            ),
          }}
        >
          {cleanedSummary}
        </ReactMarkdown>
      </div>

      {/* Sources */}
      {results.sources && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">📚 Sources</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {results.sources}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-gray-500">
    <span>
      Tools used: Wikipedia, AI and Other Research Materials by{" "}
      <span className="text-blue-600 font-semibold">JAMWASO</span>
    </span>
    <span>{new Date(results.timestamp).toLocaleString()}</span>
  </div>

  {/* Copyright */}
  <div className="mt-2 text-center text-blue-600 text-[10px] font-medium">
    © {new Date().getFullYear()} AcaWise. All rights reserved.
  </div>
    </div>
  );
};

export default ResearchResults;

/// ACTUAL CODE ENDS

// import React from "react";
// import { Save, Download } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import jsPDF from "jspdf";

// const cleanMarkdown = (text) => {
//   if (!text) return "";
//   return text
//     .replace(/^#{1,6}\s*/gm, "") // remove all # headings
//     .replace(/[-*]\s*(\d+\.\s)/g, "$1") // Remove bullets before numbered lines
//     .replace(/^\*\s+/gm, "- ") // Convert * to dash lists
//     .replace(/\*\*/g, "") // remove bold markers
//     .replace(/\*/g, ""); // Remove stray *
// };

// // Component to bold numbered headings on-screen
// const NumberedHeading = ({ children }) => {
//   const text = children?.[0] || "";
//   const isNumberedHeading = /^\d+(\.\d+)*\.\s+/.test(text);
//   return (
//     <p className={`mb-3 sm:mb-4 leading-relaxed ${isNumberedHeading ? "font-bold" : ""}`}>
//       {children}
//     </p>
//   );
// };

// const ResearchResults = ({ results }) => {
//   if (!results) return null;

//   const cleanedSummary = cleanMarkdown(results.summary);

//   const handleExport = () => {
//     const doc = new jsPDF({ unit: "pt", format: "a4" });
//     let y = 40;

//     // Title
//     doc.setFont("Helvetica", "bold");
//     doc.setFontSize(20);
//     doc.text("Research Results", 40, y);
//     y += 30;

//     // Topic
//     doc.setFont("Helvetica", "bold");
//     doc.setFontSize(14);
//     doc.text(`Topic: ${results.topic}`, 40, y);
//     y += 25;

//     // Content
//     const lines = cleanedSummary.split("\n");
//     doc.setFontSize(12);

//     lines.forEach((line) => {
//       if (!line.trim()) {
//         y += 8; // spacing for blank lines
//         return;
//       }

//       // Bold numbered headings
//       if (/^\d+(\.\d+)*\.\s+/.test(line)) {
//         doc.setFont("Helvetica", "bold");
//       } else {
//         doc.setFont("Helvetica", "normal");
//       }

//       // Bullet points
//       if (/^\-\s+/.test(line)) {
//         line = "• " + line.replace(/^\-\s+/, "");
//       }

//       const wrappedLines = doc.splitTextToSize(line, 500);
//       wrappedLines.forEach((t) => {
//         if (y > 770) {
//           doc.addPage();
//           y = 40;
//         }
//         doc.text(t, 40, y);
//         y += 16;
//       });
//     });

//     // Sources
//     if (results.sources) {
//       y += 20;
//       if (y > 770) {
//         doc.addPage();
//         y = 40;
//       }
//       doc.setFont("Helvetica", "bold");
//       doc.text("Sources:", 40, y);
//       y += 16;

//       doc.setFont("Helvetica", "normal");
//       const sourceLines = doc.splitTextToSize(results.sources, 500);
//       sourceLines.forEach((t) => {
//         if (y > 770) {
//           doc.addPage();
//           y = 40;
//         }
//         doc.text(t, 40, y);
//         y += 14;
//       });
//     }

//     doc.save(`${results.topic.replace(/\s+/g, "_")}_Research.pdf`);
//   };

//   const handleSaveMarkdown = () => {
//     const md = [
//       `# Research Results`,
//       ``,
//       `**Topic:** ${results.topic || ""}`,
//       ``,
//       `**Generated On:** ${results.timestamp || new Date().toLocaleString()}`,
//       ``,
//       `**Tools:** ${Array.isArray(results.tool_used) ? results.tool_used.join(", ") : results.tool_used || ""}`,
//       ``,
//       `## Content:`,
//       "",
//       cleanedSummary,
//       "",
//       `## Sources:`,
//       "",
//       Array.isArray(results.sources) ? results.sources.join("\n") : (results.sources || ""),
//     ].join("\n");

//     const blob = new Blob([md], { type: "text/markdown" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `ResearchResults_${Date.now()}.md`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 animate-fadeIn space-y-4 sm:space-y-6 lg:space-y-8 mx-2 sm:mx-0">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 sm:pb-4 space-y-3 sm:space-y-0">
//         <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Research Results</h3>
//         <div className="flex space-x-3 sm:space-x-4">
//           <button 
//             onClick={handleSaveMarkdown} 
//             className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50" 
//             title="Save as Markdown"
//           >
//             <Save className="w-3 sm:w-4 h-3 sm:h-4" />
//             <span className="hidden xs:inline">Save</span>
//           </button>
//           <button
//             onClick={handleExport}
//             className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
//           >
//             <Download className="w-3 sm:w-4 h-3 sm:h-4" />
//             <span className="hidden xs:inline">PDF</span>
//           </button>
//         </div>
//       </div>

//       {/* Topic */}
//       <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
//         <h4 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">
//           Topic: <span className="font-bold">{results.topic}</span>
//         </h4>
//       </div>

//       {/* Markdown Renderer */}
//       <div className="markdown-content prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-bold prose-p:leading-relaxed">
//         <ReactMarkdown
//           remarkPlugins={[remarkGfm]}
//           components={{
//             p: NumberedHeading,
//             ul: ({ node, ...props }) => (
//               <ul className="list-disc list-inside ml-3 sm:ml-5 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />
//             ),
//             ol: ({ node, ...props }) => (
//               <ol className="list-decimal list-inside ml-3 sm:ml-5 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />
//             ),
//             li: ({ node, ...props }) => (
//               <li className="leading-relaxed text-gray-800 text-sm sm:text-base" {...props} />
//             ),
//           }}
//         >
//           {cleanedSummary}
//         </ReactMarkdown>
//       </div>

//       {/* Sources */}
//       {results.sources && (
//         <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
//           <h4 className="font-semibold text-gray-800 mb-2">📚 Sources</h4>
//           <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">
//             {results.sources}
//           </p>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between text-gray-500 space-y-2 sm:space-y-0 pt-2 sm:pt-0 border-t sm:border-t-0">
//         <span className="text-xs sm:text-sm break-words">
//           Tools used: Wikipedia, AI and Other Research Materials by{" "}
//           <span className="text-blue-600 font-semibold">JAMWASO</span>
//         </span>
//         <span className="text-xs sm:text-sm">{new Date(results.timestamp).toLocaleString()}</span>
//       </div>

//       {/* Copyright */}
//       <div className="text-center text-blue-600 text-[10px] sm:text-xs font-medium pt-1">
//         © {new Date().getFullYear()} AcaWise. All rights reserved.
//       </div>
//     </div>
//   );
// };

// export default ResearchResults;