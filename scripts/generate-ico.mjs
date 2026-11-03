/**
 * Creates an ICO file buffer containing one or more PNG buffers.
 * Supported by all modern browsers (Chrome, Firefox, Safari, Edge) and Googlebot.
 * @param {Array<{ width: number, height: number, buffer: Buffer }>} images
 * @returns {Buffer}
 */
export function createIco(images) {
  const headerLength = 6;
  const dirEntryLength = 16;
  const numImages = images.length;
  const headerAndDirLength = headerLength + (dirEntryLength * numImages);

  let currentOffset = headerAndDirLength;
  const entries = [];

  for (const img of images) {
    const entry = Buffer.alloc(dirEntryLength);
    // Width (1 byte, 0 means 256)
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    // Height (1 byte, 0 means 256)
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    // Color palette (0 means no palette)
    entry.writeUInt8(0, 2);
    // Reserved
    entry.writeUInt8(0, 3);
    // Color planes (1)
    entry.writeUInt16LE(1, 4);
    // Bits per pixel (32 for RGBA PNG)
    entry.writeUInt16LE(32, 6);
    // Image data size in bytes
    entry.writeUInt32LE(img.buffer.length, 8);
    // Offset of image data from beginning of ICO
    entry.writeUInt32LE(currentOffset, 12);

    entries.push(entry);
    currentOffset += img.buffer.length;
  }

  const header = Buffer.alloc(headerLength);
  header.writeUInt16LE(0, 0); // Reserved, must be 0
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images

  return Buffer.concat([header, ...entries, ...images.map((img) => img.buffer)]);
}

