/**
 * Animated Weather Icons — Pure CSS
 * Each icon is a self-contained styled-component with keyframe animations.
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

// ─── Keyframes ───

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.96); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

const rainDrop = keyframes`
  0% { transform: translateY(-4px); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
`;

const snowFall = keyframes`
  0% { transform: translateY(-4px) rotate(0deg); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateY(10px) rotate(120deg); opacity: 0; }
`;

const flash = keyframes`
  0%, 100% { opacity: 0; }
  10% { opacity: 1; }
  12% { opacity: 0; }
  20% { opacity: 0.8; }
  22% { opacity: 0; }
`;

const drift = keyframes`
  0%, 100% { transform: translateX(0); opacity: 0.6; }
  50% { transform: translateX(3px); opacity: 0.9; }
`;

// ─── Container ───

const IconWrapper = styled.div<{ size?: number }>`
  width: ${p => p.size || 48}px;
  height: ${p => p.size || 48}px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

// ─── Sun ───

const SunBody = styled.div<{ size?: number }>`
  width: ${p => (p.size || 48) * 0.4}px;
  height: ${p => (p.size || 48) * 0.4}px;
  background: radial-gradient(circle, #fbbf24, #f59e0b);
  border-radius: 50%;
  box-shadow: 0 0 ${p => (p.size || 48) * 0.25}px rgba(251, 191, 36, 0.5),
              0 0 ${p => (p.size || 48) * 0.5}px rgba(251, 191, 36, 0.2);
  animation: ${pulse} 3s ease-in-out infinite;
  position: relative;
  z-index: 2;
`;

const SunRays = styled.div<{ size?: number }>`
  position: absolute;
  width: ${p => (p.size || 48) * 0.75}px;
  height: ${p => (p.size || 48) * 0.75}px;
  animation: ${spin} 20s linear infinite;
  z-index: 1;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.6) 20%, transparent 40%, transparent 60%, rgba(251, 191, 36, 0.6) 80%, transparent 100%);
    transform-origin: center;
  }
  &::before { transform: translate(-50%, -50%) rotate(0deg); }
  &::after { transform: translate(-50%, -50%) rotate(60deg); }

  & > span {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.6) 20%, transparent 40%, transparent 60%, rgba(251, 191, 36, 0.6) 80%, transparent 100%);
    transform: translate(-50%, -50%) rotate(120deg);
  }
`;

// ─── Moon ───

const MoonBody = styled.div<{ size?: number }>`
  width: ${p => (p.size || 48) * 0.38}px;
  height: ${p => (p.size || 48) * 0.38}px;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  border-radius: 50%;
  box-shadow: 0 0 ${p => (p.size || 48) * 0.2}px rgba(226, 232, 240, 0.3),
              inset -3px -2px 0 rgba(148, 163, 184, 0.4);
  animation: ${pulse} 4s ease-in-out infinite;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 20%;
    right: 15%;
    width: 25%;
    height: 25%;
    background: rgba(148, 163, 184, 0.3);
    border-radius: 50%;
  }
`;

// ─── Cloud ───

const CloudBody = styled.div<{ size?: number; color?: string }>`
  position: relative;
  width: ${p => (p.size || 48) * 0.55}px;
  height: ${p => (p.size || 48) * 0.28}px;
  background: ${p => p.color || 'rgba(255, 255, 255, 0.85)'};
  border-radius: 999px;
  animation: ${float} 4s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    bottom: 45%;
    left: 20%;
    width: 40%;
    height: 100%;
    background: inherit;
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 35%;
    left: 45%;
    width: 30%;
    height: 80%;
    background: inherit;
    border-radius: 50%;
  }
`;

// ─── Rain drops ───

const RainContainer = styled.div`
  position: absolute;
  bottom: 10%;
  left: 25%;
  width: 50%;
  height: 30%;
`;

const Drop = styled.div<{ delay: number; left: string }>`
  position: absolute;
  left: ${p => p.left};
  width: 2px;
  height: 6px;
  background: linear-gradient(to bottom, rgba(96, 165, 250, 0.8), rgba(96, 165, 250, 0));
  border-radius: 1px;
  animation: ${rainDrop} 0.8s ease-in infinite;
  animation-delay: ${p => p.delay}s;
`;

// ─── Snow flakes ───

const SnowContainer = styled.div`
  position: absolute;
  bottom: 8%;
  left: 20%;
  width: 60%;
  height: 35%;
`;

const Flake = styled.div<{ delay: number; left: string }>`
  position: absolute;
  left: ${p => p.left};
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: ${snowFall} 1.5s ease-in infinite;
  animation-delay: ${p => p.delay}s;
`;

// ─── Lightning bolt ───

const Lightning = styled.div`
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 10px;
  background: #fbbf24;
  animation: ${flash} 3s ease-in-out infinite;
  clip-path: polygon(40% 0%, 100% 0%, 30% 50%, 80% 50%, 0% 100%, 30% 45%, 0% 45%);
  width: 8px;
  height: 14px;
`;

// ─── Fog lines ───

const FogContainer = styled.div<{ size?: number }>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: ${p => (p.size || 48) * 0.6}px;
`;

const FogLine = styled.div<{ delay: number; width: string }>`
  height: 2px;
  width: ${p => p.width};
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  animation: ${drift} 3s ease-in-out infinite;
  animation-delay: ${p => p.delay}s;
`;

// ─── Exported Icon Components ───

interface IconProps {
  size?: number;
}

export const ClearDayIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <SunRays size={size}><span /></SunRays>
    <SunBody size={size} />
  </IconWrapper>
);

export const ClearNightIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <MoonBody size={size} />
  </IconWrapper>
);

export const PartlyCloudyDayIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '10%', left: '10%' }}>
      <SunBody size={size * 0.6} />
    </div>
    <div style={{ position: 'absolute', bottom: '10%', right: '5%' }}>
      <CloudBody size={size * 0.9} />
    </div>
  </IconWrapper>
);

export const PartlyCloudyNightIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '10%', left: '10%' }}>
      <MoonBody size={size * 0.6} />
    </div>
    <div style={{ position: 'absolute', bottom: '10%', right: '5%' }}>
      <CloudBody size={size * 0.9} />
    </div>
  </IconWrapper>
);

export const CloudyIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '15%', left: '10%' }}>
      <CloudBody size={size * 0.8} color="rgba(255,255,255,0.5)" />
    </div>
    <div style={{ position: 'absolute', bottom: '15%', right: '5%' }}>
      <CloudBody size={size} color="rgba(255,255,255,0.75)" />
    </div>
  </IconWrapper>
);

export const FogIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <FogContainer size={size}>
      <FogLine delay={0} width="100%" />
      <FogLine delay={0.4} width="75%" />
      <FogLine delay={0.8} width="90%" />
      <FogLine delay={1.2} width="60%" />
      <FogLine delay={0.2} width="85%" />
    </FogContainer>
  </IconWrapper>
);

export const DrizzleIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '10%' }}>
      <CloudBody size={size * 0.9} color="rgba(200,210,220,0.8)" />
    </div>
    <RainContainer>
      <Drop delay={0} left="20%" />
      <Drop delay={0.4} left="60%" />
    </RainContainer>
  </IconWrapper>
);

export const RainIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '8%' }}>
      <CloudBody size={size * 0.9} color="rgba(180,195,210,0.85)" />
    </div>
    <RainContainer>
      <Drop delay={0} left="15%" />
      <Drop delay={0.25} left="40%" />
      <Drop delay={0.5} left="65%" />
    </RainContainer>
  </IconWrapper>
);

export const HeavyRainIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '5%' }}>
      <CloudBody size={size * 0.95} color="rgba(150,165,180,0.9)" />
    </div>
    <RainContainer>
      <Drop delay={0} left="10%" />
      <Drop delay={0.15} left="28%" />
      <Drop delay={0.3} left="46%" />
      <Drop delay={0.45} left="64%" />
      <Drop delay={0.1} left="80%" />
    </RainContainer>
  </IconWrapper>
);

export const SnowIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '8%' }}>
      <CloudBody size={size * 0.9} color="rgba(210,220,230,0.85)" />
    </div>
    <SnowContainer>
      <Flake delay={0} left="15%" />
      <Flake delay={0.5} left="45%" />
      <Flake delay={1.0} left="70%" />
    </SnowContainer>
  </IconWrapper>
);

export const HeavySnowIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '5%' }}>
      <CloudBody size={size * 0.95} color="rgba(200,210,225,0.9)" />
    </div>
    <SnowContainer>
      <Flake delay={0} left="10%" />
      <Flake delay={0.3} left="28%" />
      <Flake delay={0.6} left="46%" />
      <Flake delay={0.9} left="64%" />
      <Flake delay={0.2} left="80%" />
    </SnowContainer>
  </IconWrapper>
);

export const ThunderstormIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <IconWrapper size={size}>
    <div style={{ position: 'absolute', top: '5%' }}>
      <CloudBody size={size * 0.95} color="rgba(120,130,150,0.9)" />
    </div>
    <Lightning />
    <RainContainer>
      <Drop delay={0.1} left="20%" />
      <Drop delay={0.4} left="70%" />
    </RainContainer>
  </IconWrapper>
);

// ─── Icon Resolver ───

export function getWeatherIcon(iconName: string, isDay: boolean, size?: number): JSX.Element {
  const s = size || 48;
  switch (iconName) {
    case 'clear':
      return isDay ? <ClearDayIcon size={s} /> : <ClearNightIcon size={s} />;
    case 'partly-cloudy':
      return isDay ? <PartlyCloudyDayIcon size={s} /> : <PartlyCloudyNightIcon size={s} />;
    case 'cloudy':
      return <CloudyIcon size={s} />;
    case 'fog':
      return <FogIcon size={s} />;
    case 'drizzle':
      return <DrizzleIcon size={s} />;
    case 'rain':
      return <RainIcon size={s} />;
    case 'heavy-rain':
      return <HeavyRainIcon size={s} />;
    case 'snow':
      return <SnowIcon size={s} />;
    case 'heavy-snow':
      return <HeavySnowIcon size={s} />;
    case 'thunderstorm':
      return <ThunderstormIcon size={s} />;
    default:
      return isDay ? <ClearDayIcon size={s} /> : <ClearNightIcon size={s} />;
  }
}
