/// <reference types="chrome"/>
import React, { useState, useEffect, Ref } from 'react'
import styled from 'styled-components';
import Tile from './Tile';


import mock from "../mock.json";
import { defaultTopSites } from '../../data/';

const TilesContainer = styled.div`
    display: flex;
    max-width: 600px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 20px;
    align-items: start;
`;


export const TopSites = ({ }) => {


    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
         // comment this on development
        chrome.topSites.get(async topSites => {
            topSites = topSites.slice(0, 8);
            // if sites are not exactly 8, then compensate for them.
            if (topSites.length < 8) {
                const toCompensate = 8 - topSites.length;
                // make sure we are not duplicately adding fallback site which exists in top sites
                // hold all origins
                const existingSiteSet = new Set();
                topSites.map(s => {
                    const urlObj = new URL(s.url);
                    existingSiteSet.add(urlObj.hostname.replace(/www./g, ''));
                });
                console.log(existingSiteSet);
                // now add the
                for (const site of defaultTopSites) {
                    const urlObject = new URL(site.url);
                    // if existing top sites not has the site from default, add it
                    console.log("debug", urlObject);
                    if (!existingSiteSet.has(urlObject.hostname.replace(/www./g, ''))) {
                        topSites.push(site);
                    }
                    if (topSites.length >=8) break;
                }
            }
            const tiles: Array<any> = topSites.map(site => {

                const url:URL = new URL(site.url);
                const { protocol, host, origin, href  } = url;
               //  chrome://favicon2/?size=24&scale_factor=1x&show_fallback_monogram=&page_url=http%3A%2F%2Fyoutube.com%2F
                // const favicon_path = `chrome://favicon2/?size=24&scale_factor=1x&show_fallback_monogram=&page_url=${encodeURIComponent(href)}`;
                const favicon_path = `${origin}/favicon.ico`;

                return {
                    title: site.title,
                    url: site.url,
                    favicon: favicon_path
                };

            });
            setSites(tiles as any);
            setLoading(false);
        });

        // uncomment this on development
        // const tiles = mock.tiles;
        // setSites(tiles as any);
        // setLoading(false);
    }, []);

    if (loading) {
        return <div>loading...</div>
    }
    return (
        <TilesContainer>
            {
                sites.map((site: any) => (
                    <Tile title={site.title} url={site.url} icon={site.favicon} />
                ))
            }
        </TilesContainer>
    )
}

