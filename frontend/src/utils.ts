export const b64encode = (arr: Uint8Array): string => btoa(String.fromCharCode.apply(null, arr as unknown as number[]));
export const b64decode = (s: string): Uint8Array => Uint8Array.from(atob(s), c => c.charCodeAt(0));
