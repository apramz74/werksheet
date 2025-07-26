import React, { useState } from 'react';
import { MathProblem } from '../types';
import ProblemEditor from './ProblemEditor';
import EmptyState from './EmptyState';
import CreateProblemModal from './CreateProblemModal';

interface ProblemListProps {
  problems: MathProblem[];
  onUpdateProblem: (index: number, problem: MathProblem) => void;
  onDeleteProblem: (index: number) => void;
  onAddProblem: (index: number) => void;
}

const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  onUpdateProblem,
  onDeleteProblem,
  onAddProblem
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingAfterIndex, setPendingAfterIndex] = useState<number>(-1);

  const handleShowCreateModal = (afterIndex: number) => {
    setPendingAfterIndex(afterIndex);
    setShowCreateModal(true);
  };

  const handleCreateProblem = (problemType: string) => {
    // For now, only handle basic-equation type
    if (problemType === 'basic-equation') {
      onAddProblem(pendingAfterIndex);
    }
    setShowCreateModal(false);
    setPendingAfterIndex(-1);
  };

  const handleUpdateProblem = (index: number, updatedProblem: MathProblem) => {
    onUpdateProblem(index, updatedProblem);
  };

  const handleDeleteProblem = (problemId: string) => {
    const index = problems.findIndex(p => p.id === problemId);
    if (index !== -1) {
      onDeleteProblem(index);
    }
  };

  const handleCreateFirstProblem = () => {
    handleShowCreateModal(-1); // Add at beginning
  };

  return (
    <>
      {problems.length === 0 ? (
        // Show empty state if no problems
        <EmptyState onCreateProblem={handleCreateFirstProblem} />
      ) : (
        // Show problem list if problems exist
        <div style={{ 
          backgroundColor: 'transparent'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => handleShowCreateModal(problems.length - 1)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + Add Problem
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {problems.map((problem, index) => (
              <ProblemEditor
                key={problem.id}
                problem={problem}
                index={index}
                onUpdate={(updatedProblem) => handleUpdateProblem(index, updatedProblem)}
                onDelete={handleDeleteProblem}
                onAddAfter={handleShowCreateModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Problem Modal - Always rendered */}
      <CreateProblemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProblem}
      />
    </>
  );
};

export default ProblemList;