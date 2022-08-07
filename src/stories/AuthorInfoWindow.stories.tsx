import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { AuthorInfoWindow } from '../newTab/SettingsWindow';

//👇 This default export determines where your story goes in the story list
export default {
    title: 'Example/AuthorInfoWindow',
    component: AuthorInfoWindow,

} as ComponentMeta<typeof AuthorInfoWindow>;


export function AuthorCard(){
    return (
        <div style={{position:"relative"}}>
            <AuthorInfoWindow/>
        </div>
    )
} 
