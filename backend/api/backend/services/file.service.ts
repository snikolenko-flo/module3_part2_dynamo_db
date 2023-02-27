import { load } from 'piexifjs';

export const getMetadata = function (buffer: Buffer, type: string): object {
  let metadata = {};
  if (type === 'image/jpeg') {
    metadata = load(buffer.toString('binary'));
  }
  return metadata;
};
