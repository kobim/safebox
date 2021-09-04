import React, { useState, useCallback, createContext, useContext } from 'react';
import { Switch } from '@headlessui/react';

const DISABLE_LIVE_UPDATES_KEY = 'safebox__liveUpdates';

interface LiveUpdatesContextData {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}
const LiveUpdatesContext = createContext<LiveUpdatesContextData>({
  enabled: true,
  setEnabled: () => {},
});

const LiveUpdatesProvider: React.FC = ({ children }) => {
  const [liveUpdates, setLiveUpdates] = useState<boolean>(localStorage.getItem(DISABLE_LIVE_UPDATES_KEY) === null);
  const onChange = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        localStorage.removeItem(DISABLE_LIVE_UPDATES_KEY);
      } else {
        localStorage.setItem(DISABLE_LIVE_UPDATES_KEY, '1');
      }
      setLiveUpdates(enabled);
    },
    [setLiveUpdates]
  );

  return (
    <LiveUpdatesContext.Provider value={{ enabled: liveUpdates, setEnabled: onChange }}>
      {children}
    </LiveUpdatesContext.Provider>
  );
};

const LiveUpdatesToggle: React.FC = () => {
  const { enabled, setEnabled } = useContext(LiveUpdatesContext);

  return (
    <Switch.Group>
      <div className="flex items-center mt-4">
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${
            enabled ? 'bg-green-600' : 'bg-gray-200'
          } relative inline-flex items-center h-5 rounded-full w-10 mr-2`}
          title="Enable live update"
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-3 h-3 transform bg-white rounded-full`}
          />
        </Switch>
        <Switch.Label className="mr-2">
          Live Updates{' '}
          {enabled ? <span className="text-green-600">enabled</span> : <span className="text-gray-400">disabled</span>}
        </Switch.Label>
      </div>
    </Switch.Group>
  );
};

export { LiveUpdatesToggle, LiveUpdatesContext, LiveUpdatesProvider };
