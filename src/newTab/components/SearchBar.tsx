/// <reference types="chrome"/>
// @ts-nocheck
import React, { useState, useEffect, Ref } from 'react'
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';

import searchIcon from "../../icons/search_icon.png";
import downArrow from "../../assets/svg/down_arrow.svg";
import returnKey from "../../assets/svg/return-key.svg";
import googleIcon from "../../assets/images/google.png";
import yahooIcon from "../../assets/images/yahoo.png";
import bingIcon from "../../assets/images/bing.png";
import duckDuckGoIcon from "../../assets/images/duckduckgo.png";
import { getObjectFromStorageLocal } from '../../helpers/storage';

const StyledSearchBar = styled.div`
    box-sizing: border-box;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    background: white;
    margin: 1rem;
    position: relative;
`
const StyledSearchWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 0.5rem;
    flex: 1;
    margin-left: -0.5rem;
`;

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
    display: flex;
    align-items: center;
    padding: 0.5rem;
    cursor:pointer;
    &:hover {
        background: #efefef;
    }
    text-align: left;
    font-size: 1rem;
    &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
    }
    &.active {
        background: #efefef;
    }

`;
const StyledSuggestionPreIcon = styled.div`
    width: 5rem;
    display: flex;
    justify-content: center;
`;
const StyledSuggestionPostIcon = styled.div`
    justify-self: flex-end;
    margin-left: auto;
    margin-right: 0.5rem;
    & > img {
        width: 24px;
        display: none;
    }
    &.show > img {
        display: block;
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

const StyledSearchEngineSelectWrapper = styled.div`
    position: relative;
    display flex;
    align-items: center;
    padding: 0.5rem;
`;
const StyledSearchEngineSelectValue = styled.div`
    display: flex;
    align-items: center;
    & > img {
        width: 24px;
    }
    border: 1px solid #c1c1c1;
    border-radius: 0.2rem;
    padding: 0.5rem;
    cursor: pointer;
`;
const StyledSearchEngineOptions = styled.div`
    position: absolute;
    top: 100%;
    left: 0%;
    background: white;
    margin-top: 0.5rem;
    z-index: 99;
    margin-left: 0.5rem;
    border-radius: 0.5rem;
    overflow: hidden;
    width: 150px;
    border: 1px solid #efefef;
    filter: drop-shadow(2px 2px 4px black);
`;

const StyledSearchEngineOption = styled.div`
    display: flex;
    align-items: center;
    padding: 0.8rem 0.5rem;
    cursor: pointer;
    & > img {
        width: 24px;
    }
    & > span {
        font-size: 1rem;
        margin-left: 0.5rem;
    }
    &:hover {
        background: #efefef;
    }
    &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
    }
    &.active {
        background: #efefef;
    }
`;

interface SearchEngineSelectorProps {
    onEngineChange: any,
    searchEngines: any,
    currentEngineId: string,
}

function SearchEngineSelector({ onEngineChange, searchEngines, currentEngineId = 'google'}: SearchEngineSelectorProps) {
    const [show, setShow] = useState(false);
    const setEngine = (engineId:string) => {
        setShow(false);
        if (typeof onEngineChange === 'function') {
            onEngineChange(engineId);
        }
    };
    const currentEngineInfo = searchEngines.find(e => e.id === currentEngineId);
    return (
        <OutsideClickHandler onOutsideClick={() => setShow(false)}>
            <StyledSearchEngineSelectWrapper>
                <StyledSearchEngineSelectValue onClick={() => setShow(!show)}>
                    <img src={currentEngineInfo?.icon} alt='search engine' />
                    <img src={downArrow} alt="ds" style={{ marginLeft: '0.5rem', width: '16px' }}/>
                </StyledSearchEngineSelectValue>
                {show  && (
                    
                        <StyledSearchEngineOptions>
                            {
                                searchEngines
                                .map(engine => (
                                    <StyledSearchEngineOption key={engine.id} onClick={() => setEngine(engine.id)}>
                                        <img src={engine.icon} alt='search engine' />
                                        <span>{engine.label}</span>
                                    </StyledSearchEngineOption>
                                ))
                            }
                        </StyledSearchEngineOptions>
                    
                )}
            </StyledSearchEngineSelectWrapper>
        </OutsideClickHandler>
    )
}


export default function SearchBar() {
    const [queryText, setQueryText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const [engineId, setSearchEngineId] = useState({});
    const searchEngines = [
        {
            id: 'google',
            label: 'Google',
            icon: googleIcon,
            getSearchURL: (query: string) => `https://www.google.com/search?q=${query}`
        },
        {
            id: 'bing',
            label: 'Bing',
            icon: bingIcon,
            getSearchURL: (query: string) => `https://www.bing.com/search?q=${query}`
        },
        {
            id: 'yahoo',
            label: 'Yahoo',
            icon: yahooIcon,
            getSearchURL: (query: string) => `https://search.yahoo.com/search?p=${query}`
        },
        {
            id: 'duckduckgo',
            label: 'Duck Duck Go',
            icon: duckDuckGoIcon,
            getSearchURL: (query: string) => `https://duckduckgo.com/?q=${query}`,
        }
    ];
    const search = () => {
        if (queryText.trim() === '') return;
        doSearch(queryText.trim());
    }
    const doSearch = (val: string) => {
        // @ts-ignore
        const engine = searchEngines.find(e => e.id === engineId);
        console.log(val, engine);
        window.location.href = engine.getSearchURL(val);
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

    const onSearchEngineChange = (engineId : any) => {
        setSearchEngineId(engineId);
        chrome.storage.local.set({ searchEngineId: engineId });
    }
    useEffect(async () => {
        const { searchEngineId = 'google' } = await getObjectFromStorageLocal("searchEngineId");
        setSearchEngineId(searchEngineId);
    }, []);

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
                    if (activeSuggestionIndex < 0) return;
                    const query = suggestions[activeSuggestionIndex];
                    console.log('hittinh this as well?', activeSuggestionIndex);
                    doSearch(query);
                    break;
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [suggestions, activeSuggestionIndex]);

    return (
        <StyledSearchBar>
            <SearchEngineSelector
                onEngineChange={onSearchEngineChange}
                currentEngineId={engineId}
                searchEngines={searchEngines}
            />
            <StyledSearchWrapper>
                <StyledInput
                    type="text"
                    placeholder="search here..."
                    value={queryText}
                    onKeyDown={onEnter}
                    onChange={e => setQueryText(e.target.value)}
                />
                <StyledSearchIcon src={searchIcon} alt="search" onClick={search} />
            </StyledSearchWrapper>
            {
             showSuggestions && (
                <OutsideClickHandler onOutsideClick={()=>setShowSuggestions(false)}>
                    <StyledSuggestionsWrapper>
                        {suggestions.map((suggestion,i) => (
                            <StyledSuggestion
                                onClick={() => selectAndSearch(suggestion)}
                                // @ts-ignore
                                className={i === activeSuggestionIndex && 'active'}>
                                <StyledSuggestionPreIcon>
                                    {/* <img src={searchIcon} alt="search icon" /> */}
                                </StyledSuggestionPreIcon>
                                <div>
                                    {suggestion}
                                </div>
                                <StyledSuggestionPostIcon
                                    className={`ss-post-icon ${i === activeSuggestionIndex && 'show'}`}
                                >
                                    <img src={returnKey} alt="enter key" />
                                </StyledSuggestionPostIcon>
                            </StyledSuggestion>
                        ))}
                    </StyledSuggestionsWrapper>
                </OutsideClickHandler>
            )}
        </StyledSearchBar>
    );
};

