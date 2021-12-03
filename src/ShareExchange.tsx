import React, { useCallback, useState } from 'react';
import QRCode from 'qrcode.react';

interface Params {
  name: string;
}

const COPY_TEXT = 'copy URL to clipboard';

const ShareExchange: React.FC<Params> = ({ name }) => {
  const [copyText, setCopyText] = useState<string>(COPY_TEXT);
  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyText('copied!');
      setTimeout(() => {
        setCopyText(COPY_TEXT);
      }, 1000);
    });
  }, []);

  return (
    <>
      <div className="flex sm:flex-row flex-col text-center">
        <div className="sm:mr-4 sm:w-80">
          <p>Ask the other party to scan the QR code</p>
          <p>- or -</p>
          <p>share this URL with them</p>
          <p className="mt-2">
            <button type="button" onClick={copyUrl} className="underline hover:text-gray-500">
              {copyText}
            </button>
          </p>
        </div>
        <div className="flex-1 sm:mt-0 mt-4">
          <QRCode
            value={window.location.href}
            size={128}
            bgColor={'#ffffff'}
            fgColor={'#000000'}
            level={'L'}
            includeMargin={false}
            renderAs={'svg'}
            className="mx-auto shadow-md"
            imageSettings={{
              src: '/logo192.png',
              height: 48,
              width: 48,
              excavate: false,
            }}
          />
        </div>
      </div>
      <p className="text-center sm:mt-2 mt-6 text-gray-500">They will be able to see should verify they reply to</p>
      <p className="text-center font-semibold">{name}</p>
    </>
  );
};

export default ShareExchange;
