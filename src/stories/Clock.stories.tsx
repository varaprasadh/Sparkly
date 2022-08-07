import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Clock from '../newTab/Clock';

//👇 This default export determines where your story goes in the story list
export default {
    title: 'Example/Clock',
    component: Clock,

} as ComponentMeta<typeof Clock>;


export function ClockWrapper() {
    return (
        <div style={{ position: "relative" }}>
            <Clock />
        </div>
    )
}
