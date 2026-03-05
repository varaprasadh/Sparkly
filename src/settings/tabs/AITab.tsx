/**
 * Sparkly AI Settings Tab
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { GeneralSettings } from '../../types/settings.types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const CardDesc = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
`;

const Badge = styled.span<{ color: string; textColor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  background: ${(p) => p.color};
  color: ${(p) => p.textColor};
`;

const Dot = styled.span<{ dotColor: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => p.dotColor};
  flex-shrink: 0;
`;

const PrimaryBtn = styled.button`
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: #3b82f6;
  color: white;
  transition: background 0.15s;
  white-space: nowrap;
  &:hover { background: #2563eb; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const DangerBtn = styled.button`
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  transition: background 0.15s;
  white-space: nowrap;
  &:hover { background: #fee2e2; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ProgressWrap = styled.div`
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ value: number }>`
  height: 100%;
  width: ${(p) => p.value}%;
  background: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s;
`;

const ProgressText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
`;

const ToggleSwitch = styled.div<{ checked: boolean }>`
  width: 44px;
  height: 24px;
  background: ${(p) => (p.checked ? '#3b82f6' : '#d1d5db')};
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
  &::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: ${(p) => (p.checked ? '23px' : '3px')};
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 0 -20px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const InfoItem = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
`;

const InfoLabel = styled.p`
  margin: 0 0 2px 0;
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompatResult {
  supported: boolean;
  backend: 'webgpu' | 'wasm';
  reason?: string;
}

type ModelState = 'unknown' | 'not-downloaded' | 'downloading' | 'ready' | 'deleting';

interface AITabProps {
  settings: GeneralSettings;
  onUpdate: (updates: Partial<GeneralSettings>) => void;
}

const MODEL_NAME = 'SmolLM2-360M-Instruct';
const MODEL_SIZE = '~360 MB';

// ── Component ─────────────────────────────────────────────────────────────────

export function AITab({ settings, onUpdate }: AITabProps): JSX.Element {
  const [compat, setCompat] = useState<CompatResult | null>(null);
  const [modelState, setModelState] = useState<ModelState>('unknown');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'AI_GET_STATUS' }, () => void chrome.runtime.lastError);
  }, []);

  useEffect(() => {
    const listener = (message: Record<string, any>) => {
      if (message.type === 'AI_STATUS_RESULT') {
        setCompat(message.compat as CompatResult);
        setModelState(message.modelCached ? 'ready' : 'not-downloaded');
        return;
      }
      if (message.type === 'AI_STATUS') {
        if (message.status === 'downloading') {
          setModelState('downloading');
          setStatusMessage(message.message || 'Downloading…');
          if (typeof message.progress === 'number') setDownloadProgress(message.progress);
        } else if (message.status === 'ready') {
          setModelState('ready');
          setStatusMessage('');
          setDownloadProgress(100);
        }
        return;
      }
      if (message.type === 'AI_DELETE_RESULT') {
        setModelState('not-downloaded');
        setDownloadProgress(0);
        setStatusMessage('');
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleDownload = useCallback(() => {
    setModelState('downloading');
    setDownloadProgress(0);
    chrome.runtime.sendMessage({ type: 'AI_LOAD_MODEL' }, () => void chrome.runtime.lastError);
  }, []);

  const handleDelete = useCallback(() => {
    setModelState('deleting');
    chrome.runtime.sendMessage({ type: 'AI_DELETE_MODEL' }, () => void chrome.runtime.lastError);
  }, []);

  const isGPU = compat?.backend === 'webgpu';

  return (
    <Container>

      {/* Enable toggle */}
      <Card>
        <CardRow>
          <div>
            <CardTitle>Page Summarization</CardTitle>
            <CardDesc>
              Adds a floating ✦ button on every webpage. Click it to summarize the page or ask questions — all processed locally on your device, nothing sent to any server.
            </CardDesc>
          </div>
          <Toggle>
            <HiddenCheckbox
              checked={!!settings.showAI}
              onChange={(e) => onUpdate({ showAI: e.target.checked })}
            />
            <ToggleSwitch checked={!!settings.showAI} />
          </Toggle>
        </CardRow>
      </Card>

      {/* Device compatibility */}
      <Card>
        <CardRow>
          <CardTitle>Device Compatibility</CardTitle>
          {compat === null ? (
            <Badge color="#f3f4f6" textColor="#6b7280">Checking…</Badge>
          ) : isGPU ? (
            <Badge color="#dcfce7" textColor="#166534">
              <Dot dotColor="#16a34a" />WebGPU · GPU
            </Badge>
          ) : (
            <Badge color="#fef9c3" textColor="#854d0e">
              <Dot dotColor="#ca8a04" />WASM · CPU
            </Badge>
          )}
        </CardRow>

        {compat && (
          <>
            <Divider />
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Acceleration</InfoLabel>
                <InfoValue>{isGPU ? 'GPU (fast)' : 'CPU (slow)'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Expected speed</InfoLabel>
                <InfoValue>{isGPU ? '2 – 5 sec' : '20 – 60 sec'}</InfoValue>
              </InfoItem>
            </InfoGrid>
            {compat.reason && <CardDesc>ℹ️ {compat.reason}</CardDesc>}
          </>
        )}
      </Card>

      {/* Model management */}
      <Card>
        <CardRow>
          <div>
            <CardTitle>AI Model</CardTitle>
            <CardDesc>{MODEL_NAME} · {MODEL_SIZE} · Downloaded once, cached in your browser</CardDesc>
          </div>
          {modelState === 'ready' && (
            <Badge color="#dcfce7" textColor="#166534"><Dot dotColor="#16a34a" />Ready</Badge>
          )}
          {modelState === 'not-downloaded' && (
            <Badge color="#f3f4f6" textColor="#6b7280">Not downloaded</Badge>
          )}
          {modelState === 'unknown' && (
            <Badge color="#f3f4f6" textColor="#6b7280">Checking…</Badge>
          )}
          {modelState === 'downloading' && (
            <Badge color="#dbeafe" textColor="#1d4ed8"><Dot dotColor="#3b82f6" />Downloading</Badge>
          )}
          {modelState === 'deleting' && (
            <Badge color="#fee2e2" textColor="#991b1b">Deleting…</Badge>
          )}
        </CardRow>

        {modelState === 'downloading' && (
          <>
            <ProgressWrap><ProgressFill value={downloadProgress} /></ProgressWrap>
            <ProgressText>{statusMessage || 'Downloading model…'}</ProgressText>
          </>
        )}

        <Divider />

        <CardRow>
          <CardDesc style={{ margin: 0, flex: 1 }}>
            {modelState === 'not-downloaded' && 'Download the model to enable on-device AI. Requires ~360 MB of storage.'}
            {modelState === 'ready' && 'Model is ready. Delete it to free up ~360 MB of storage.'}
            {modelState === 'downloading' && 'Please wait while the model downloads…'}
            {modelState === 'deleting' && 'Removing model from cache…'}
            {modelState === 'unknown' && 'Checking model status…'}
          </CardDesc>

          {modelState === 'not-downloaded' && (
            <PrimaryBtn onClick={handleDownload}>Download Model</PrimaryBtn>
          )}
          {modelState === 'ready' && (
            <DangerBtn onClick={handleDelete}>Delete Model</DangerBtn>
          )}
          {modelState === 'downloading' && (
            <PrimaryBtn disabled>Downloading…</PrimaryBtn>
          )}
          {modelState === 'deleting' && (
            <DangerBtn disabled>Deleting…</DangerBtn>
          )}
        </CardRow>
      </Card>

    </Container>
  );
}

export default AITab;
