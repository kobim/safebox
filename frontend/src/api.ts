import axios, { AxiosResponse } from 'axios';

import type { Exchange, SavedExchange, Subject } from './bindings';
import { generateKey } from './crypto';
import { b64encode } from './utils';

export const newExchange = async (): Promise<string> => {
  const { data: uuid } = await axios.post('/api/new');

  const { publicKey: key, name } = await generateKey(uuid, 'first');

  await axios.put(`/api/m/${uuid}/init`, {
    key,
    name,
  } as Subject);

  return uuid;
};

export const getExchange = async (uuid: string) => axios.get<Exchange>(`/api/m/${uuid}`);

export const acceptExchange = async (uuid: string, subject: Subject, ivBytes: Uint8Array) =>
  axios.patch<Partial<SavedExchange>, AxiosResponse<Exchange>>(
    `/api/m/${uuid}`,
    {
      second: subject,
      iv: b64encode(ivBytes),
    } as Partial<SavedExchange>,
    {
      auth: {
        username: 'second',
        password: subject.name,
      },
    }
  );

export const saveExchange = async (uuid: string, subjectName: string, encryptedBytes: Uint8Array) =>
  axios.patch<Partial<Exchange>, AxiosResponse<Exchange>>(
    `/api/m/${uuid}`,
    {
      encMessage: b64encode(new Uint8Array(encryptedBytes)),
    } as Partial<Exchange>,
    {
      auth: {
        username: 'second',
        password: subjectName,
      },
    }
  );
