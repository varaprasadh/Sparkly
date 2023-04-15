import React, { useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import styled from 'styled-components';
import { Resizable } from 're-resizable';

export interface StickyNoteProps {
    id: number;
    text: string;
    x: number;
    y: number;
    onDragStart?: (id: number) => void;
    onDragEnd?: (id: number, x: number, y: number) => void;
    onEdit?: (id: number, text: string) => void;
    onResize: (direction: any, width: number, height: number) => void;
}

interface StyledStickyNoteProps {
    x: number;
    y: number;
}

const StyledStickyNote = styled.div<StyledStickyNoteProps>`
  position: absolute;
  background-color: yellow;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  user-select: none;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  width: 100px;
  height: 100px;
  &:active {
    cursor: grabbing;
  }
`;

const StickyNote: React.FC<StickyNoteProps> = ({
    id,
    text,
    onDragEnd,
    onEdit,
    onResize,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text);

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setDragStart({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if (!isDragging) return;
        const dx = event.clientX - dragStart.x;
        const dy = event.clientY - dragStart.y;
        setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setDragStart({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (onDragEnd) onDragEnd(id, position.x, position.y);
    };

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (onEdit) onEdit(id, editedText);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedText(event.target.value);
    };

    return (
        <OutsideClickHandler onOutsideClick={() => setIsEditing(false)}>
            <Resizable
                defaultSize={{
                    width: 320,
                    height: 200,
                }}
                onResizeStop={(e, direction, ref, d) => {
                   
                }}
            >
                <StyledStickyNote
                    x={position.x}
                    y={position.y}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onDoubleClick={handleDoubleClick}
                    contentEditable={isEditing}
                >
                    {text}
                </StyledStickyNote>
            </Resizable>
        </OutsideClickHandler>
    );
};

export default StickyNote;
