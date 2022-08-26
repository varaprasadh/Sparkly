/// <reference types="chrome"/>
import React, { useState, useEffect, Ref } from 'react'
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';

import searchIcon from "../../icons/search_icon.png";

const StyledSearchBar = styled.div`
    box-sizing: border-box;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    padding: 0.5rem;
    background: white;
    margin: 1rem;
    position: relative;
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
    margin-left: 0.5rem;
    transition: all 0.1s ease;
    &:active{
        transform: scale(0.8);
    }
`;
const StyledSuggestionsWrapper = styled.div`
    position: absolute;
    top: 100%;
    left: 0%;
    right: 0%;
    z-index: 99;
    background: white;
    margin-top: 0.2rem;
    border-radius: 0.5rem;
    overflow: hidden;
`;
const StyledSuggestion = styled.div`
    padding: 0.5rem;
    cursor:pointer;
    &:hover {
        background: #efefef;
    }
    text-align: left;
    padding-left: 2.5rem;
    font-size: 1rem;
    &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
    }
    &.active {
        background: #efefef;
    }

`;

function debounce(func: any, wait: any) {
    let timeout: any;
    return function (...args: any) {
        // @ts-ignore
        const context = this;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            func.apply(context, args);
        }, wait);
    };
}
export default function SearchBar() {
    const [queryText, setQueryText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

    const search = () => {
        if (queryText.trim() === '') return;
        doSearch(queryText.trim());
    }
    const doSearch = (val: string) => {
        window.location.href = `https://www.google.com/search?q=${val}`;
    }
    const onEnter = (e: any) => {
        if (e.which === 13) {
            search();
        }
    };
    const selectAndSearch = (value: string) => {
        doSearch(value);
    };

    const getSuggestions = async (value:string) => {
        const url = `http://suggestqueries.google.com/complete/search?client=chrome&q=${value}`;
        const [target, results] = await fetch(url).then(res => res.json());
        setShowSuggestions(results.length > 0);
        setSuggestions(results);
    };
    const debouncedGetSuggestions = React.useCallback(debounce(getSuggestions, 300), []);

    useEffect(() => {
        setActiveSuggestionIndex(-1);
       try {
           debouncedGetSuggestions(queryText);
       } catch (error) {
          console.log(error);
       }
    }, [queryText]);

    useEffect(()=> {
        // handling focus on suggestions
        const onKeyDown = (e: KeyboardEvent) => {
            if (suggestions.length === 0) return;
            const event = e || window.event;
            const key = event.which || event.keyCode;
            switch (key) {
                case 38:
                    // handle up key
                    let index = activeSuggestionIndex - 1;
                    if (index < 0) index = suggestions.length - 1;
                    setActiveSuggestionIndex(index);
                    break;
                case 40:
                    // handle down
                    const nextActiveSuggestion = (activeSuggestionIndex + 1) % suggestions.length;
                    setActiveSuggestionIndex(nextActiveSuggestion);
                    break;
                case 13:
                    const query = suggestions[activeSuggestionIndex];
                    doSearch(query);
                    break;
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [suggestions, activeSuggestionIndex]);

    return (
        <StyledSearchBar>
            <StyledSearchIcon src={searchIcon} alt="search" onClick={search} />
            <StyledInput
                type="text"
                placeholder="search here..."
                value={queryText}
                onKeyDown={onEnter}
                onChange={e => setQueryText(e.target.value)}
            />
            {
             showSuggestions && (
                <OutsideClickHandler onOutsideClick={()=>setShowSuggestions(false)}>
                    <StyledSuggestionsWrapper>
                        {suggestions.map((suggestion,i) => (
                            <StyledSuggestion
                                onClick={() => selectAndSearch(suggestion)}
                                // @ts-ignore
                                className={i === activeSuggestionIndex && 'active'}>
                                {suggestion}
                            </StyledSuggestion>
                        ))}
                    </StyledSuggestionsWrapper>
                </OutsideClickHandler>
            )}
        </StyledSearchBar>
    );
};

