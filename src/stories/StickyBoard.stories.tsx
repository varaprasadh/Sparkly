import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';

import StickyBoard, { StickyBoardProps } from './StickyBoard/StickyBoard';
import StickyNote, { StickyNoteProps } from './StickyBoard/StickyNote';

export default {
    title: 'Components/StickyApp',
} as Meta;

const Template: Story<StickyBoardProps> = (args) => {
    const [notes, setNotes] = useState<StickyNoteProps[]>([
        {
            id: 1,
            text: 'Note 1',
            x: 100,
            y: 100,
            
        },
    ]);

    const handleNoteDragEnd = (id: number, left: number, top: number) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                note.id === id ? { ...note, left, top } : note
            )
        );
    };

    return (
        <StickyBoard {...args}>
            {notes.map((note) => (
                <StickyNote
                    key={note.id}
                    {...note}
                    onDragEnd={handleNoteDragEnd}
                />
            ))}
        </StickyBoard>
    );
};

export const Default = Template.bind({});
Default.args = {
    // set default props here if any
    width: 500,
    height: 500
};
