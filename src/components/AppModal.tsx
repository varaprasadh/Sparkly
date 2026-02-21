/**
 * AppModal - OS-like modal window for apps/plugins
 */

import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div<{ zIndex: number }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${(props) => props.zIndex};
  pointer-events: none;
`;

const ModalWindow = styled.div<{ isMinimized: boolean }>`
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: ${(props) => (props.isMinimized ? 'none' : 'flex')};
  flex-direction: column;
  overflow: hidden;
  pointer-events: all;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const AppIcon = styled.span`
  font-size: 20px;
`;

const AppTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
`;

const WindowControls = styled.div`
  display: flex;
  gap: 8px;
`;

const WindowButton = styled.button<{ variant?: 'close' | 'minimize' }>`
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.15s;
  background: ${(props) =>
    props.variant === 'close'
      ? '#fee2e2'
      : props.variant === 'minimize'
      ? '#fef3c7'
      : '#e5e7eb'};
  color: ${(props) =>
    props.variant === 'close'
      ? '#dc2626'
      : props.variant === 'minimize'
      ? '#d97706'
      : '#4b5563'};

  &:hover {
    background: ${(props) =>
      props.variant === 'close'
        ? '#fecaca'
        : props.variant === 'minimize'
        ? '#fde68a'
        : '#d1d5db'};
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  max-height: 60vh;
`;

interface AppModalProps {
  pluginId: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  children: React.ReactNode;
}

export function AppModal({
  pluginId,
  title,
  icon,
  isOpen,
  isMinimized,
  zIndex,
  onClose,
  onMinimize,
  children,
}: AppModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <Overlay zIndex={100 + zIndex}>
      <ModalWindow isMinimized={isMinimized}>
        <ModalHeader>
          <AppIcon>{icon}</AppIcon>
          <AppTitle>{title}</AppTitle>
          <WindowControls>
            <WindowButton variant="minimize" onClick={onMinimize} title="Minimize">
              −
            </WindowButton>
            <WindowButton variant="close" onClick={onClose} title="Close">
              ×
            </WindowButton>
          </WindowControls>
        </ModalHeader>
        <ModalContent>{children}</ModalContent>
      </ModalWindow>
    </Overlay>
  );
}

export default AppModal;
