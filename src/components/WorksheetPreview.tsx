import React, { useState, useEffect, useCallback } from "react";
import { MathProblem, WorksheetSettings } from "../types";
import { MathFormatter } from "../utils/mathFormatter";
import {
  paginateProblems,
  PAGE_DIMENSIONS_PX,
  FONT_SIZES,
  SPACING_PX,
} from "../utils/layoutCalculations";

// Helper function to determine if a problem is suitable for compact layouts
const isCompactLayoutSuitable = (problem: MathProblem): boolean => {
  return problem.type === 'basic-equation' || problem.type === 'fill-blanks';
};

// Helper function to determine if a problem is suitable for two-column layout
const isTwoColumnSuitable = (problem: MathProblem): boolean => {
  return problem.type === 'basic-equation' || 
         problem.type === 'fill-blanks' || 
         problem.type === 'multiple-choice';
};

// Render problem in compact format (like traditional worksheet)
const renderCompactProblem = (problem: MathProblem, globalIndex: number) => {
  if (problem.type === 'fill-blanks') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontSize: `${FONT_SIZES.problemText * 0.9}px`,
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: '8px 4px',
        minHeight: '50px',
        width: '100%'
      }}>
        <div style={{ marginBottom: '2px', fontWeight: 'normal', fontSize: `${FONT_SIZES.problemText * 0.8}px` }}>
          {globalIndex + 1})
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          fontSize: `${FONT_SIZES.problemText * 0.9}px`,
          lineHeight: '1.2',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ borderBottom: '1px solid #000', minWidth: '30px', height: '14px', margin: '0 auto' }}></div>
          </div>
          <div style={{ width: '100%', margin: '2px 0', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '5px' }}>{problem.operator}</span>
            <span style={{ position: 'absolute', right: '5px' }}>{problem.rightOperand}</span>
          </div>
          <div style={{ borderBottom: '1px solid #000', width: '100%', height: '1px', margin: '2px 0' }}></div>
        </div>
      </div>
    );
  } else if (problem.type === 'basic-equation') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontSize: `${FONT_SIZES.problemText * 0.9}px`,
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: '8px 4px',
        minHeight: '50px',
        width: '100%'
      }}>
        <div style={{ marginBottom: '2px', fontWeight: 'normal', fontSize: `${FONT_SIZES.problemText * 0.8}px` }}>
          {globalIndex + 1})
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          fontSize: `${FONT_SIZES.problemText * 0.9}px`,
          lineHeight: '1.2',
          width: '100%'
        }}>
          <div style={{ textAlign: 'right', width: '100%' }}>
            {problem.leftOperand}
          </div>
          <div style={{ width: '100%', margin: '2px 0', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '5px' }}>{problem.operator}</span>
            <span style={{ position: 'absolute', right: '5px' }}>{problem.rightOperand}</span>
          </div>
          <div style={{ borderBottom: '1px solid #000', width: '100%', height: '1px', margin: '2px 0' }}></div>
        </div>
      </div>
    );
  }
  return null;
};

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
  const hasFootnote = settings.footnote.trim().length > 0;
  const pages = paginateProblems(validProblems, hasFootnote);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, pages.length]);

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
  }, [currentPage, pages.length, onNavigationChange, handlePrevPage, handleNextPage]);

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
            {settings.layout === 'compact-grid' ? (
              // Compact Grid Layout - 10 columns for simple problems (like traditional worksheets)
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 1fr)',
                gap: '48px',
                marginBottom: '20px'
              }}>
                {currentPageProblems.map((problem, index) => {
                  const globalIndex =
                    pages
                      .slice(0, currentPage)
                      .reduce((sum, page) => sum + page.length, 0) + index;

                  if (isCompactLayoutSuitable(problem)) {
                    return (
                      <div key={problem.id}>
                        {renderCompactProblem(problem, globalIndex)}
                      </div>
                    );
                  } else {
                    // Fall back to single column for complex problems
                    return (
                      <div key={problem.id} style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
                        <div style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: `${0.3 * 96}px`,
                        }}>
                          <span style={{
                            fontSize: `${FONT_SIZES.problemNumber}px`,
                            fontWeight: "bold",
                            color: "#000",
                            fontFamily: "Helvetica, Arial, sans-serif",
                            flexShrink: 0,
                          }}>
                            {globalIndex + 1}.
                          </span>
                          <div style={{ flex: 1 }}>
                            {problem.type === "multiple-choice" ? (
                              <div>
                                <div style={{
                                  fontSize: `${FONT_SIZES.problemText}px`,
                                  fontWeight: "normal",
                                  color: "#000",
                                  marginBottom: `${SPACING_PX.multipleChoiceQuestionHeight}px`,
                                  fontFamily: "Helvetica, Arial, sans-serif",
                                }}>
                                  {problem.question}
                                </div>
                                <div>
                                  {problem.options?.map((option, optIndex) => (
                                    <div key={optIndex} style={{
                                      fontSize: `${FONT_SIZES.problemText}px`,
                                      fontWeight: "normal",
                                      color: "#000",
                                      marginBottom: `${SPACING_PX.multipleChoiceOptionHeight}px`,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      fontFamily: "Helvetica, Arial, sans-serif",
                                    }}>
                                      <div style={{
                                        width: `${0.08 * 96 * 2}px`,
                                        height: `${0.08 * 96 * 2}px`,
                                        border: "1px solid #000",
                                        borderRadius: "50%",
                                        backgroundColor: "white",
                                        flexShrink: 0,
                                      }}></div>
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
                            ) : problem.type === "word-problem" ? (
                              <div>
                                <div style={{
                                  fontSize: `${FONT_SIZES.problemText}px`,
                                  fontWeight: "normal",
                                  color: "#000",
                                  fontFamily: "Helvetica, Arial, sans-serif",
                                  lineHeight: "1.4",
                                  marginBottom: `${0.2 * 96}px`,
                                }}>
                                  {problem.problemText}
                                </div>
                                <div style={{
                                  borderBottom: "1px solid #000",
                                  width: `${2 * 96}px`,
                                  height: "16px",
                                }}></div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            ) : settings.layout === 'two-column' ? (
              // Two Column Layout
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '20px'
              }}>
                {currentPageProblems.map((problem, index) => {
                  const globalIndex =
                    pages
                      .slice(0, currentPage)
                      .reduce((sum, page) => sum + page.length, 0) + index;

                  if (isTwoColumnSuitable(problem)) {
                    return (
                      <div key={problem.id} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}>
                        <span style={{
                          fontSize: `${FONT_SIZES.problemNumber}px`,
                          fontWeight: "bold",
                          color: "#000",
                          fontFamily: "Helvetica, Arial, sans-serif",
                          flexShrink: 0,
                        }}>
                          {globalIndex + 1}.
                        </span>
                        <div style={{ flex: 1 }}>
                          {problem.type === "multiple-choice" ? (
                            <div>
                              <div style={{
                                fontSize: `${FONT_SIZES.problemText * 0.9}px`,
                                fontWeight: "normal",
                                color: "#000",
                                marginBottom: "8px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                              }}>
                                {problem.question}
                              </div>
                              <div>
                                {problem.options?.map((option, optIndex) => (
                                  <div key={optIndex} style={{
                                    fontSize: `${FONT_SIZES.problemText * 0.85}px`,
                                    fontWeight: "normal",
                                    color: "#000",
                                    marginBottom: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontFamily: "Helvetica, Arial, sans-serif",
                                  }}>
                                    <div style={{
                                      width: "12px",
                                      height: "12px",
                                      border: "1px solid #000",
                                      borderRadius: "50%",
                                      backgroundColor: "white",
                                      flexShrink: 0,
                                    }}></div>
                                    <span>{String.fromCharCode(65 + optIndex)}) {option}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : problem.type === "fill-blanks" ? (
                            <div style={{
                              fontSize: `${FONT_SIZES.problemText}px`,
                              fontWeight: "normal",
                              color: "#000",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontFamily: "Helvetica, Arial, sans-serif",
                            }}>
                              <div style={{
                                borderBottom: "1px solid #000",
                                minWidth: "40px",
                                height: "16px",
                              }}></div>
                              <span>{problem.operator}</span>
                              <span>{problem.rightOperand}</span>
                              <span>=</span>
                              <span>{problem.result}</span>
                            </div>
                          ) : (
                            <div style={{
                              fontSize: `${FONT_SIZES.problemText}px`,
                              fontWeight: "normal",
                              color: "#000",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontFamily: "Helvetica, Arial, sans-serif",
                            }}>
                              <span>{problem.leftOperand}</span>
                              <span>{problem.operator}</span>
                              <span>{problem.rightOperand}</span>
                              <span>=</span>
                              <div style={{
                                borderBottom: "1px solid #000",
                                minWidth: "40px",
                                height: "16px",
                              }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    // Fall back to single column for complex problems (word problems)
                    return (
                      <div key={problem.id} style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
                        <div style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: `${0.3 * 96}px`,
                        }}>
                          <span style={{
                            fontSize: `${FONT_SIZES.problemNumber}px`,
                            fontWeight: "bold",
                            color: "#000",
                            fontFamily: "Helvetica, Arial, sans-serif",
                            flexShrink: 0,
                          }}>
                            {globalIndex + 1}.
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: `${FONT_SIZES.problemText}px`,
                              fontWeight: "normal",
                              color: "#000",
                              fontFamily: "Helvetica, Arial, sans-serif",
                              lineHeight: "1.4",
                              marginBottom: `${0.2 * 96}px`,
                            }}>
                              {problem.problemText}
                            </div>
                            <div style={{
                              borderBottom: "1px solid #000",
                              width: `${2 * 96}px`,
                              height: "16px",
                            }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              // Single Column Layout (default)
              currentPageProblems.map((problem, index) => {
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
                      gap: `${0.3 * 96}px`,
                      marginLeft: "0",
                      paddingLeft: "0",
                    }}
                  >
                    <span style={{
                      fontSize: `${FONT_SIZES.problemNumber}px`,
                      fontWeight: "bold",
                      color: "#000",
                      fontFamily: "Helvetica, Arial, sans-serif",
                      flexShrink: 0,
                    }}>
                      {globalIndex + 1}.
                    </span>
                    <div style={{ flex: 1 }}>
                      {problem.type === "multiple-choice" ? (
                        <div>
                          <div style={{
                            fontSize: `${FONT_SIZES.problemText}px`,
                            fontWeight: "normal",
                            color: "#000",
                            marginBottom: `${SPACING_PX.multipleChoiceQuestionHeight}px`,
                            fontFamily: "Helvetica, Arial, sans-serif",
                          }}>
                            {problem.question}
                          </div>
                          <div>
                            {problem.options?.map((option, optIndex) => (
                              <div key={optIndex} style={{
                                fontSize: `${FONT_SIZES.problemText}px`,
                                fontWeight: "normal",
                                color: "#000",
                                marginBottom: `${SPACING_PX.multipleChoiceOptionHeight}px`,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                              }}>
                                <div style={{
                                  width: `${0.08 * 96 * 2}px`,
                                  height: `${0.08 * 96 * 2}px`,
                                  border: "1px solid #000",
                                  borderRadius: "50%",
                                  backgroundColor: "white",
                                  flexShrink: 0,
                                }}></div>
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
                      ) : problem.type === "word-problem" ? (
                        <div>
                          <div style={{
                            fontSize: `${FONT_SIZES.problemText}px`,
                            fontWeight: "normal",
                            color: "#000",
                            fontFamily: "Helvetica, Arial, sans-serif",
                            lineHeight: "1.4",
                            marginBottom: `${0.2 * 96}px`,
                          }}>
                            {problem.problemText}
                          </div>
                          <div style={{
                            borderBottom: "1px solid #000",
                            width: `${2 * 96}px`,
                            height: "16px",
                          }}></div>
                        </div>
                      ) : problem.type === "fill-blanks" ? (
                        <div style={{
                          fontSize: `${FONT_SIZES.problemText}px`,
                          fontWeight: "normal",
                          color: "#000",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontFamily: "Helvetica, Arial, sans-serif",
                        }}>
                          <div style={{
                            borderBottom: "1px solid #000",
                            minWidth: `${1 * 96}px`,
                            height: "16px",
                          }}></div>
                          <span>{problem.operator}</span>
                          <span>{problem.rightOperand}</span>
                          <span>=</span>
                          <span>{problem.result}</span>
                        </div>
                      ) : (
                        <div style={{
                          fontSize: `${FONT_SIZES.problemText}px`,
                          fontWeight: "normal",
                          color: "#000",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontFamily: "Helvetica, Arial, sans-serif",
                        }}>
                          <span>{problem.leftOperand}</span>
                          <span>{problem.operator}</span>
                          <span>{problem.rightOperand}</span>
                          <span>=</span>
                          <div style={{
                            borderBottom: "1px solid #000",
                            minWidth: `${1 * 96}px`,
                            height: "16px",
                          }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footnote */}
          {settings.footnote.trim() && (
            <div
              style={{
                position: "absolute",
                bottom: `${PAGE_DIMENSIONS_PX.margin + 0.2 * 96}px`,
                left: "0",
                right: "0",
                textAlign: "center",
                fontSize: `${FONT_SIZES.footer}px`,
                fontFamily: "Helvetica, Arial, sans-serif",
                color: "#000",
              }}
            >
              {settings.footnote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorksheetPreview;
