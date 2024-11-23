// src/utils/encoding.ts

export const encodeBase64 = (arrayBuffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(arrayBuffer);
  const binaryString = bytes.reduce(
    (str, byte) => str + String.fromCharCode(byte),
    ""
  );
  return btoa(binaryString);
};
