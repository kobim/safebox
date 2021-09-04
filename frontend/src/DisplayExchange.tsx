import React, { SetStateAction, useContext, useMemo } from 'react';

import { LiveUpdatesContext } from './LiveUpdates';

import { Exchange, SubjectRole } from './bindings';

interface Params {
  exchange: Exchange;
  role: SubjectRole;
  text: string;
  setText: React.Dispatch<SetStateAction<string>>;
  submit: () => Promise<void>;
}

const ExchangeDisplay: React.FC<Params> = ({ role, exchange, text, setText, submit }) => {
  const submitDisabled = useMemo<boolean>(
    () => text.length === 0 && exchange?.encMessage === undefined,
    [text, exchange]
  );

  const { enabled: updatesEnabled } = useContext(LiveUpdatesContext);

  return role === 'first' ? (
    <>
      <div className="flex sm:flex-row flex-col">
        <div className="pr-2 space-y-2 relative h-36 sm:h-auto sm:flex-1">
          <p>
            Data received from <span className="font-semibold">{exchange.second?.name}</span>
          </p>
          <p>
            This exchange is named <span className="font-semibold">{exchange.first.name}</span>
          </p>
          <p className="text-sm">You can only read data.</p>
          <p className="text-sm sm:absolute bottom-0">
            ({updatesEnabled ? 'updated live' : 'refresh to check for updates'})
          </p>
        </div>
        <div className="flex-1 flex flex-col">
          <textarea
            className="border border-gray-200 border-solid outline-none p-2 h-56 resize-none"
            readOnly={true}
            defaultValue={text}
          ></textarea>
        </div>
      </div>
      {text.length === 0 && <p className="text-sm text-right">No data yet</p>}
    </>
  ) : (
    <>
      <div className="flex sm:flex-row flex-col">
        <div className="pr-2 space-y-2 relative h-36 sm:h-auto sm:flex-1">
          <p>
            Exchanging with <span className="font-semibold">{exchange.first.name}</span>
          </p>
          <p>
            Your name is <span className="font-semibold">{exchange.second?.name}</span>
          </p>
          <p className="text-sm sm:absolute bottom-0 pr-2">
            You can write everything in the text box and it will be encrypted and sent once you click{' '}
            <span className="italic">Save</span>.
          </p>
        </div>
        <div className="flex-1 flex flex-col">
          <textarea
            onChange={e => setText(e.target.value)}
            value={text}
            className="border border-gray-200 border-solid focus:border-green-500 outline-none p-2 h-56 resize-none"
          ></textarea>
        </div>
      </div>
      <div className="text-right">
        <button
          type="submit"
          onClick={submit}
          disabled={submitDisabled}
          className="font-medium text-green-600 hover:text-green-500 disabled:text-gray-300"
        >
          Save
        </button>
      </div>
    </>
  );
};

export default ExchangeDisplay;
