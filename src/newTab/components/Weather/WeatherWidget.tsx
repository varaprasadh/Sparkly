/**
 * Weather Widget — pairs seamlessly with the clock
 * Renders inline below the clock as a subtle, glassy weather strip.
 */

import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { WeatherData, fetchWeather, getGeolocation, getWeatherCondition, clearWeatherCache } from './weatherService';
import { getWeatherIcon } from './WeatherIcons';

// ─── Animations ───

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ─── Styled Components ───

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.6s ease-out;
  user-select: none;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  cursor: default;
  transition: background 0.3s, border-color 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const TempSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Temperature = styled.span`
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1;
`;

const Unit = styled.span`
  font-size: 0.9rem;
  font-weight: 400;
  opacity: 0.6;
  margin-left: -2px;
  align-self: flex-start;
  margin-top: 2px;
`;

const Divider = styled.div`
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ConditionText = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.9;
  line-height: 1.2;
`;

const SubText = styled.span`
  font-size: 0.65rem;
  font-weight: 400;
  opacity: 0.5;
  line-height: 1.2;
`;

const HighLow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  opacity: 0.5;
  font-weight: 500;
`;

const HighLowItem = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Arrow = styled.span<{ up?: boolean }>`
  font-size: 0.6rem;
  color: ${p => p.up ? '#f87171' : '#60a5fa'};
  text-shadow: none;
`;

// ─── Loading skeleton ───

const SkeletonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
  animation: ${fadeIn} 0.4s ease-out;
`;

const SkeletonPulse = styled.div<{ width: string; height?: string }>`
  width: ${p => p.width};
  height: ${p => p.height || '14px'};
  border-radius: 8px;
  background: linear-gradient(90deg,
    rgba(255,255,255,0.06) 25%,
    rgba(255,255,255,0.12) 50%,
    rgba(255,255,255,0.06) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;

// ─── Error state ───

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
  }
`;

// ─── Component ───

interface WeatherWidgetProps {
  unit?: 'celsius' | 'fahrenheit';
}

type Status = 'loading' | 'ready' | 'error' | 'permission-denied';

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ unit = 'celsius' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const loadWeather = useCallback(async () => {
    setStatus('loading');
    try {
      const location = await getGeolocation();
      const data = await fetchWeather(location, unit);
      setWeather(data);
      setStatus('ready');
    } catch (err: any) {
      const msg = err?.message || 'Failed to load weather';
      if (msg.includes('denied') || msg.includes('permission')) {
        setStatus('permission-denied');
        setErrorMsg('Location access needed');
      } else {
        setStatus('error');
        setErrorMsg('Weather unavailable');
      }
    }
  }, [unit]);

  // Load on mount and when unit changes
  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // Refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);

  // Clear cache when unit changes to force refresh
  useEffect(() => {
    clearWeatherCache();
  }, [unit]);

  if (status === 'loading') {
    return (
      <SkeletonContainer>
        <SkeletonPulse width="32px" height="32px" style={{ borderRadius: '50%' }} />
        <SkeletonPulse width="50px" height="20px" />
        <SkeletonPulse width="70px" height="12px" />
      </SkeletonContainer>
    );
  }

  if (status === 'error' || status === 'permission-denied') {
    return (
      <ErrorContainer onClick={loadWeather} title="Click to retry">
        <span>{status === 'permission-denied' ? '📍' : '⚠️'}</span>
        <span>{errorMsg}</span>
      </ErrorContainer>
    );
  }

  if (!weather) return null;

  const condition = getWeatherCondition(weather.weatherCode);
  const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';

  return (
    <Container title={`${weather.locationName} · Feels like ${weather.feelsLike}${unitSymbol} · Humidity ${weather.humidity}%`}>
      {getWeatherIcon(condition.icon, weather.isDay, 40)}
      <TempSection>
        <Temperature>{weather.temperature}°</Temperature>
        <Unit>{unit === 'fahrenheit' ? 'F' : 'C'}</Unit>
      </TempSection>
      <Divider />
      <InfoSection>
        <ConditionText>{condition.label}</ConditionText>
        <SubText>{weather.locationName}</SubText>
      </InfoSection>
      <HighLow>
        <HighLowItem><Arrow up>▲</Arrow>{weather.high}°</HighLowItem>
        <HighLowItem><Arrow>▼</Arrow>{weather.low}°</HighLowItem>
      </HighLow>
    </Container>
  );
};

export default WeatherWidget;
