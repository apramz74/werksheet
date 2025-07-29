import React, { useState, useEffect } from "react";
import { MathProblem, WorksheetSettings } from "../types";
import { MathFormatter } from "../utils/mathFormatter";
import {
  paginateProblems,
  PAGE_DIMENSIONS_PX,
  FONT_SIZES,
  SPACING_PX,
} from "../utils/layoutCalculations";

interface WorksheetPreviewProps {
  problems: MathProblem[];
  settings: WorksheetSettings;
  onNavigationChange?: (
    currentPage: number,
    totalPages: number,
    handlers: { handlePrevPage: () => void; handleNextPage: () => void }
  ) => void;
}

const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({
  problems,
  settings,
  onNavigationChange,
}) => {
  // Filter out problems that are invalid
  const validProblems = problems.filter((problem) =>
    MathFormatter.validateProblem(problem)
  );

  // Pagination state
  const pages = paginateProblems(validProblems);
  const [currentPage, setCurrentPage] = useState(0);

  // Auto-navigate to last page when new problems are added
  useEffect(() => {
    if (pages.length > 0 && currentPage >= pages.length) {
      setCurrentPage(pages.length - 1);
    }
  }, [pages.length, currentPage]);

  // Notify parent of navigation state changes
  useEffect(() => {
    if (onNavigationChange) {
      onNavigationChange(currentPage, pages.length, {
        handlePrevPage,
        handleNextPage,
      });
    }
  }, [currentPage, pages.length, onNavigationChange]);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (validProblems.length === 0) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "2px dashed #ddd",
          color: "#666",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0" }}>Worksheet Preview</h3>
        <p style={{ margin: "0" }}>Add some problems to see the preview</p>
      </div>
    );
  }

  const currentPageProblems = pages[currentPage] || [];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        backgroundColor: "white",
        fontFamily: "Helvetica, Arial, sans-serif",
        margin: "0 auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Page Content Container */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          display: "flex",
          justifyContent: "flex-start",
          padding: "20px 0",
        }}
      >
        <div
          id="worksheet-preview"
          style={{
            width: `${PAGE_DIMENSIONS_PX.width}px`,
            height: `${PAGE_DIMENSIONS_PX.height}px`,
            backgroundColor: "white",
            position: "relative",
            transform: "scale(0.7)",
            transformOrigin: "top center",
            marginBottom: `${-(PAGE_DIMENSIONS_PX.height * 0.3)}px`,
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "35px",
            }}
          >
            <h1
              style={{
                fontSize: `${FONT_SIZES.title}px`,
                margin: "0",
                color: "#000",
                fontWeight: "bold",
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              {settings.title}
            </h1>
          </div>

          {/* Problems */}
          <div>
            {currentPageProblems.map((problem, index) => {
              const globalIndex =
                pages
                  .slice(0, currentPage)
                  .reduce((sum, page) => sum + page.length, 0) + index;

              return (
                <div
                  key={problem.id}
                  style={{
                    marginBottom: `${SPACING_PX.problemSpacing}px`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: `${0.3 * 96}px`, // Exact 0.3 inch gap like PDF
                    marginLeft: "0",
                    paddingLeft: "0",
                  }}
                >
                  {/* Problem number */}
                  <span
                    style={{
                      fontSize: `${FONT_SIZES.problemNumber}px`,
                      fontWeight: "bold",
                      color: "#000",
                      fontFamily: "Helvetica, Arial, sans-serif",
                      flexShrink: 0,
                    }}
                  >
                    {globalIndex + 1}.
                  </span>

                  {/* Problem content */}
                  <div style={{ flex: 1 }}>
                    {problem.type === "multiple-choice" ? (
                      <div>
                        <div
                          style={{
                            fontSize: `${FONT_SIZES.problemText}px`,
                            fontWeight: "normal",
                            color: "#000",
                            marginBottom: `${SPACING_PX.multipleChoiceQuestionHeight}px`,
                            fontFamily: "Helvetica, Arial, sans-serif",
                          }}
                        >
                          {problem.question}
                        </div>
                        <div>
                          {problem.options?.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              style={{
                                fontSize: `${FONT_SIZES.problemText}px`,
                                fontWeight: "normal",
                                color: "#000",
                                marginBottom: `${SPACING_PX.multipleChoiceOptionHeight}px`,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                              }}
                            >
                              {/* Answer circle */}
                              <div
                                style={{
                                  width: `${0.08 * 96 * 2}px`,
                                  height: `${0.08 * 96 * 2}px`,
                                  border: "1px solid #000",
                                  borderRadius: "50%",
                                  backgroundColor: "white",
                                  flexShrink: 0,
                                }}
                              ></div>
                              <span style={{ fontWeight: "normal" }}>
                                {String.fromCharCode(65 + optIndex)})
                              </span>
                              <span style={{ fontWeight: "normal" }}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: `${FONT_SIZES.problemText}px`,
                          fontWeight: "normal",
                          color: "#000",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontFamily: "Helvetica, Arial, sans-serif",
                        }}
                      >
                        <span>{problem.leftOperand}</span>
                        <span>{problem.operator}</span>
                        <span>{problem.rightOperand}</span>
                        <span>=</span>
                        <div
                          style={{
                            borderBottom: "1px solid #000",
                            minWidth: `${1 * 96}px`,
                            height: "16px",
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetPreview;
