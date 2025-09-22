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

import React from "react";
import { Save, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";

/**
 * ResearchResults.jsx
 * - paste/replace your current ResearchResults.jsx with this file
 * - requires: react-markdown, remark-gfm, jspdf, lucide-react
 */

/* ---------------------------
   Helpers
   --------------------------- */

const cleanMarkdown = (text) => {
  if (!text) return "";

  return text
    // Remove bullets in front of numbered lines like "- 1. Something"
    .replace(/^[\-\*\u2022]\s*(\d+(\.\d+)*\.\s)/gm, "$1")
    // Normalize bullet notation: convert leading "*" to "-" for consistent parsing
    .replace(/^\*\s+/gm, "- ")
    // Remove stray single asterisks left over (keep ** bold)
    .replace(/(^|[^*])\*([^*]|$)/g, "$1$2")
    // Trim trailing spaces per line
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .join("\n");
};

// retrieve plain text from ReactMarkdown child nodes
const getTextContent = (children) => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (child && child.props && child.props.children) return getTextContent(child.props.children);
      return "";
    })
    .join("");
};

// Prepare lines for PDF (detect numbered subtitles, bullets, headings)
const preparePdfLines = (markdown) => {
  const lines = markdown.split(/\r?\n/);
  const prepared = [];

  const subtitleRegex = /^(\d+(\.\d+)*\.\s*)([A-Z0-9\-\s,&()’'":]+:?)/; // matches "1. EXECUTIVE SUMMARY:"
  const headingHash = /^#{1,6}\s*(.*)$/; // optional: support markdown headings like ## Title

  lines.forEach((raw) => {
    const line = raw.replace(/\t/g, "    ").trimRight();
    if (!line) {
      prepared.push({ type: "blank", text: "" });
      return;
    }

    // If it's an explicit markdown heading (## Something), treat as subtitle-like
    const hMatch = line.match(headingHash);
    if (hMatch) {
      prepared.push({ type: "subtitle", text: hMatch[1].trim() });
      return;
    }

    // If numbered subtitle like "1. EXECUTIVE SUMMARY:"
    const sMatch = line.match(subtitleRegex);
    if (sMatch) {
      prepared.push({ type: "subtitle", text: line.trim() });
      return;
    }

    // Bullet (dash / bullet)
    if (/^[-\u2022]\s+/.test(line)) {
      prepared.push({ type: "bullet", text: line.replace(/^[-\u2022]\s+/, "").trim() });
      return;
    }

    // Ordered list items like "1. something" (should be kept as normal or bullet-ish)
    if (/^\d+\.\s+/.test(line)) {
      prepared.push({ type: "ordered", text: line.trim() });
      return;
    }

    // Normal paragraph line
    prepared.push({ type: "text", text: line });
  });

  return prepared;
};

/* ---------------------------
   React components
   --------------------------- */

// p renderer that bolds numbered subtitles (UI)
const NumberedHeading = ({ children }) => {
  const rawText = getTextContent(children).trim();
  const isNumberedHeading = /^\d+(\.\d+)*\.\s+/.test(rawText) || /^#{1,6}\s*/.test(rawText);
  return (
    <p className={`mb-4 leading-relaxed ${isNumberedHeading ? "font-bold text-gray-900" : "text-gray-800"}`}>
      {children}
    </p>
  );
};

const ResearchResults = ({ results }) => {
  if (!results) return null;

  // Use summary (markdown) if available, else try content
  const rawMarkdown = results.summary || results.content || "";
  const cleanedSummary = cleanMarkdown(rawMarkdown);

  /* ---------------------------
     PDF Export
     --------------------------- */
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    let y = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 40;
    const maxLineWidth = pageWidth - marginLeft - 40; // right margin 40

    const lineHeight = 18;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Research Results", marginLeft, y);
    y += 28;

    // Topic
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Topic:", marginLeft, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(results.topic || "N/A"), marginLeft + 80, y);
    y += 22;

    // Sources
    if (results.sources) {
      // results.sources may be a string or array
      const sourcesArr = Array.isArray(results.sources) ? results.sources : [String(results.sources)];
      doc.setFont("helvetica", "bold");
      doc.text("Sources:", marginLeft, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      sourcesArr.forEach((s, i) => {
        if (y > pageHeight - 60) { doc.addPage(); y = 40; }
        const lines = doc.splitTextToSize(`${i + 1}. ${s}`, maxLineWidth - 20);
        doc.text(lines, marginLeft + 16, y);
        y += lines.length * 14 + 6;
      });
      y += 4;
    }

    // Metadata
    if (y > pageHeight - 80) { doc.addPage(); y = 40; }
    doc.setFont("helvetica", "bold");
    doc.text("Generated On:", marginLeft, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(results.timestamp || new Date().toLocaleString()), marginLeft + 90, y);
    y += 20;

    if (results.tool_used) {
      if (y > pageHeight - 80) { doc.addPage(); y = 40; }
      doc.setFont("helvetica", "bold");
      doc.text("Tools:", marginLeft, y);
      doc.setFont("helvetica", "normal");
      const toolsText = Array.isArray(results.tool_used) ? results.tool_used.join(", ") : String(results.tool_used);
      const toolsLines = doc.splitTextToSize(toolsText, maxLineWidth - 90);
      doc.text(toolsLines, marginLeft + 50, y);
      y += toolsLines.length * 14 + 8;
    }

    // Content heading
    if (y > pageHeight - 80) { doc.addPage(); y = 40; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Content:", marginLeft, y);
    y += 18;
    doc.setFontSize(12);

    // Prepare and render content lines with detection
    const prepared = preparePdfLines(cleanedSummary);
    prepared.forEach((item) => {
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 40;
      }

      if (item.type === "blank") {
        y += 8;
        return;
      }

      if (item.type === "subtitle") {
        doc.setFont("helvetica", "bold");
        const lines = doc.splitTextToSize(item.text, maxLineWidth);
        lines.forEach((ln) => {
          doc.text(ln, marginLeft, y);
          y += lineHeight;
          if (y > pageHeight - 60) {
            doc.addPage();
            y = 40;
          }
        });
        y += 6;
        doc.setFont("helvetica", "normal");
        return;
      }

      if (item.type === "bullet") {
        // indent bullets
        const wrapped = doc.splitTextToSize(item.text, maxLineWidth - 28);
        // first line with bullet
        doc.text("• " + wrapped[0], marginLeft + 12, y);
        y += lineHeight;
        // rest lines aligned under bullet
        for (let i = 1; i < wrapped.length; i++) {
          if (y > pageHeight - 60) { doc.addPage(); y = 40; }
          doc.text(wrapped[i], marginLeft + 28, y);
          y += lineHeight;
        }
        return;
      }

      if (item.type === "ordered") {
        const wrapped = doc.splitTextToSize(item.text, maxLineWidth - 16);
        wrapped.forEach((ln) => {
          doc.text(ln, marginLeft + 8, y);
          y += lineHeight;
          if (y > pageHeight - 60) { doc.addPage(); y = 40; }
        });
        return;
      }

      // Normal text
      const wrapped = doc.splitTextToSize(item.text, maxLineWidth);
      wrapped.forEach((ln) => {
        doc.text(ln, marginLeft, y);
        y += lineHeight;
        if (y > pageHeight - 60) { doc.addPage(); y = 40; }
      });
    });

    doc.save(`ResearchResults_${Date.now()}.pdf`);
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

  /* ---------------------------
     UI
     --------------------------- */

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-2xl font-bold text-gray-900">Research Results</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSaveMarkdown}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            title="Save as Markdown"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            title="Export as PDF"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Topic */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800">
          📌 Topic: <span className="font-bold">{results.topic}</span>
        </h4>
      </div>

      {/* Markdown rendering */}
      <div className="markdown-content prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // p -> handle numbered headings bold in UI
            p: ({ node, ...props }) => <NumberedHeading {...props} />,
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-gray-700" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-2 marker:text-gray-700" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed text-gray-800" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-gray-900" {...props} />
            ),
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-4 mb-2" {...props} />,
            // other mappings can be added if needed
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
            {Array.isArray(results.sources) ? results.sources.join(", ") : results.sources}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
        <span>
          Tools used:{" "}
          {Array.isArray(results.tool_used) ? results.tool_used.join(", ") : results.tool_used}
        </span>
        <span>{new Date(results.timestamp || Date.now()).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ResearchResults;


