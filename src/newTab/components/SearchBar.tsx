/// <reference types="chrome"/>
import React, { useState, useEffect, Ref } from 'react'
import styled from 'styled-components';

import searchIcon from "../../icons/search_icon.png";

const StyledSearchBar = styled.div`
    box-sizing: border-box;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    padding: 0.5rem;
    background: white;
    margin: 1rem;
`
const StyledInput = styled.input`
    flex: 1;
    border: none;
    padding: 0.5rem;
    font-size: 1rem;
    &:focus{
        outline: none;
    }
`
const StyledSearchIcon = styled.img`
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    margin-right: 0.5rem;
    transition: all 0.1s ease;
    &:active{
        transform: scale(0.8);
    }
`;

export default function SearchBar() {
    const [queryText, setQueryText] = useState('');

    const search = () => {
        if (queryText.trim() === '') return;
        window.location.href = `https://www.google.com/search?q=${queryText}`;
    }
    const onEnter = (e: any) => {
        if (e.which === 13) {
            search();
        }
    };

    return (
        <StyledSearchBar>
            <StyledInput
                type="text"
                placeholder="search here..."
                value={queryText}
                onKeyDown={onEnter}
                onChange={e => setQueryText(e.target.value)}
            />
            <StyledSearchIcon src={searchIcon} alt="search" onClick={search} />
        </StyledSearchBar>
    );
};

