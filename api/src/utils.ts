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
