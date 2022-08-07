import React, { useEffect, useState } from 'react'
import styled from "styled-components";

const StyledTime = styled.div`
  font-size: 2em;
  color: white;
`;

function Clock() {
    const [datetime, setDateTime] = useState(Date.now());
    useEffect(()=>{
        const timer = setInterval(()=>{
            setDateTime(Date.now())
        },1000);

        return ()=>{
            clearInterval(timer);
        }
    },[]);


    const date = new Date(datetime);
    const dateString = date.toDateString();
    return (
        <div style={{fontFamily:"sans"}}>
            <StyledTime>{dateString}</StyledTime>
        </div>
    )
}

export default Clock
