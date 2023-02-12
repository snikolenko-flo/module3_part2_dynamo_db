import { load } from 'piexifjs';

export const getMetadata = function (buffer: Buffer) {
  const metadata = load(buffer.toString('binary'));
  return metadata;
};
