import { v4 as uuidv4 } from 'uuid';

const b64decode = (s: string): Uint8Array =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export const decodeSecondAuth = ({
  headers,
}: {
  headers: Headers;
}): string | null => {
  const value = headers.get('authorization');
  if (!value) {
    return null;
  }

  const [user, pass] = new TextDecoder()
    .decode(b64decode(value.split(' ')[1]))
    .split(':');
  if (user !== 'second') {
    return null;
  }
  return pass;
};

const MAX_RETRIES = 5;

export const findAvailableKey = async (
  MESSAGES: KVNamespace,
): Promise<string | null> => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const key = uuidv4();
    const existing = await MESSAGES.get(key);
    if (!existing) {
      return key;
    }
  }

  return null;
};
