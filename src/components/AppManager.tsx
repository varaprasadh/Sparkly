/**
 * AppManager - Renders all open apps as modal windows
 */

import React, { useMemo } from 'react';
import { useApps } from '../store/hooks';
import { pluginRegistry } from '../plugins';
import { AppModal } from './AppModal';
import { createPluginAPI } from '../plugins/core/PluginAPI';

export function AppManager(): JSX.Element {
  const { openApps, closeApp, minimizeApp, getAppZIndex } = useApps();

  // Memoize API instances to avoid recreating on every render
  const apiInstances = useMemo(() => {
    const instances: Record<string, ReturnType<typeof createPluginAPI>> = {};
    openApps.forEach((app) => {
      if (!instances[app.pluginId]) {
        instances[app.pluginId] = createPluginAPI(app.pluginId);
      }
    });
    return instances;
  }, [openApps]);

  return (
    <>
      {openApps.map((app) => {
        const plugin = pluginRegistry.get(app.pluginId);
        if (!plugin) return null;

        const PluginComponent = plugin.instance.Component;
        const zIndex = getAppZIndex(app.pluginId);
        const api = apiInstances[app.pluginId];

        return (
          <AppModal
            key={app.pluginId}
            pluginId={app.pluginId}
            title={plugin.manifest.name}
            icon={plugin.manifest.icon}
            isOpen={true}
            isMinimized={app.isMinimized}
            zIndex={zIndex}
            onClose={() => closeApp(app.pluginId)}
            onMinimize={() => minimizeApp(app.pluginId)}
          >
            <PluginComponent
              api={api}
              isMinimized={app.isMinimized}
              onClose={() => closeApp(app.pluginId)}
              onMinimize={() => minimizeApp(app.pluginId)}
            />
          </AppModal>
        );
      })}
    </>
  );
}

export default AppManager;
