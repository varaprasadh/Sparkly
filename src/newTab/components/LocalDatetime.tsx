import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';

const ClockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  user-select: none;
`;

const TimeText = styled.div`
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -2px;
`;

const DateText = styled.div`
  font-size: 1.5rem;
  font-weight: 400;
  margin-top: 0.5rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const LocalDateTime = () => {
    const [currentTime, setCurrentTime] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ClockContainer>
            <TimeText>
                {currentTime.format('h:mm')}
            </TimeText>
            <DateText>
                {currentTime.format('dddd, MMMM Do')}
            </DateText>
        </ClockContainer>
    );
};

export default LocalDateTime;
