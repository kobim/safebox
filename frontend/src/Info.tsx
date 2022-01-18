import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { QuestionMarkCircleIcon } from '@heroicons/react/solid';
import { LightBulbIcon } from '@heroicons/react/outline';

const ALREADY_VISITED_KEY = 'safebox__visited';

const Info = () => {
  const [open, setOpen] = useState<boolean>(() => localStorage.getItem(ALREADY_VISITED_KEY) === null);

  const okButtonRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(ALREADY_VISITED_KEY, '1');
  }, []);

  return (
    <>
      <button
        type="button"
        className="w-6 h-6 text-green-600"
        aria-label="What's Safebox?"
        aria-hidden="true"
        onClick={() => setOpen(true)}
      >
        <QuestionMarkCircleIcon />
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={okButtonRef} onClose={() => {}}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <LightBulbIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        What's Safebox?
                      </Dialog.Title>
                      <div className="mt-2 text-sm text-gray-500 space-y-2">
                        <p>
                          Safebox allows you to receive encrypted data from someone else without the hussle of dealing
                          with encryption.
                        </p>
                        <p>
                          Safebox uses{' '}
                          <a
                            href="https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            ECDH protocol
                          </a>{' '}
                          to generate a unique shared secret between the two parties, allowing to transfer data only the
                          parties could read &amp; write.
                        </p>
                        <p>
                          The encryption parameters ("keys") never leave the browser, making sure no outsider (not even
                          Safebox) will be able to read the transferred information.
                        </p>
                        <p className="text-xs pt-4">
                          (Don't worry, the question mark on the top-right corner can be used to read this again.)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setOpen(false)}
                    ref={okButtonRef}
                  >
                    OK
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default Info;
