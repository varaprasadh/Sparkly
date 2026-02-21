/**
 * App Bootstrap - Initializes providers and registers plugins
 */

import React, { useEffect, useState } from 'react';
import { AppProvider } from '../store/AppContext';
import { PluginProvider, pluginRegistry } from '../plugins';
import { registerBuiltinPlugins } from '../plugins/builtin';
import { ZoneManager } from '../layout';
import { SettingsModal } from '../settings';

interface AppBootstrapProps {
  children: React.ReactNode;
}

/**
 * Bootstrap component that sets up all providers
 */
export function AppBootstrap({ children }: AppBootstrapProps): JSX.Element {
  const [pluginsRegistered, setPluginsRegistered] = useState(false);

  // Register built-in plugins on mount
  useEffect(() => {
    if (!pluginsRegistered) {
      registerBuiltinPlugins(pluginRegistry);
      setPluginsRegistered(true);
    }
  }, [pluginsRegistered]);

  if (!pluginsRegistered) {
    return <div>Loading...</div>;
  }

  return (
    <AppProvider>
      <PluginProvider>
        <ZoneManager showRightSidebar={true} showLeftSidebar={false}>
          {children}
        </ZoneManager>
        <SettingsModal />
      </PluginProvider>
    </AppProvider>
  );
}

export default AppBootstrap;
