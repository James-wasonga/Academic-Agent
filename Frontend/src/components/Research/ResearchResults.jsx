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

