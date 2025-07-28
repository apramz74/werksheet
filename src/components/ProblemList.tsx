import React from 'react';
import { MathProblem } from '../types';
import ProblemEditor from './ProblemEditor';
import EmptyState from './EmptyState';

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
    onAddProblem(-1); // Add at beginning - call parent's handler directly
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {problems.map((problem, index) => (
              <ProblemEditor
                key={problem.id}
                problem={problem}
                index={index}
                onUpdate={(updatedProblem) => handleUpdateProblem(index, updatedProblem)}
                onDelete={handleDeleteProblem}
                onAddAfter={onAddProblem}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProblemList;