import React, { useState } from 'react';
import styled from 'styled-components';
import StickyNote from './StickyNote';

export interface StickyBoardProps {
    width: number;
    height: number;
}

interface Position {
    x: number;
    y: number;
}

const StyledStickyBoard = styled.div<{ width: number; height: number }>`
  position: relative;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  background-color: #f6f6f6;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
`;

const AddNoteButton = styled.button`
  background-color: #e6e6e6;
  border: none;
  color: #666;
  font-size: 1.2rem;
  padding: 10px;
  border-radius: 5px;
  margin: 10px;
  cursor: pointer;

  &:hover {
    background-color: #d9d9d9;
  }

  &:focus {
    outline: none;
  }
`;

const StickyBoard: React.FC<StickyBoardProps> = ({ width, height }) => {
    const [notes, setNotes] = useState<{ text: string; position: Position }[]>([]);

    const handleNoteDragEnd = (index: number, x: number, y: number) => {
        setNotes((prev) => {
            const newNotes = [...prev];
            newNotes[index].position = { x, y };
            return newNotes;
        });
    };

    const handleAddNote = () => {
        setNotes((prev) => [...prev, { text: '', position: { x: 50, y: 50 } }]);
    };

    const handleNoteTextChange = (index: number, text: string) => {
        setNotes((prev) => {
            const newNotes = [...prev];
            newNotes[index].text = text;
            return newNotes;
        });
    };

    const handleNoteDelete = (index: number) => {
        setNotes((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <StyledStickyBoard width={width} height={height}>
            {notes.map((note, index) => (
                <StickyNote
                    id={0}
                    x={100}
                    y={100}
                    key={index}
                    text={note.text}
                    onDragEnd={(x, y) => handleNoteDragEnd(index, x, y)}
                    />
            ))}
            <AddNoteButton onClick={handleAddNote}>Add Note</AddNoteButton>
        </StyledStickyBoard>
    );
};

export default StickyBoard;
