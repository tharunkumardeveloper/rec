// Fix WebM video duration metadata
// MediaRecorder creates WebM files without duration, this fixes it

export async function fixWebmDuration(blob: Blob, durationMs: number): Promise<Blob> {
  try {
    console.log(`Fixing WebM duration to ${durationMs}ms (${(durationMs/1000).toFixed(2)}s)`);
    
    const buffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    // Find Info element (0x1549A966) which contains Duration
    let infoOffset = -1;
    for (let i = 0; i < uint8.length - 20; i++) {
      if (uint8[i] === 0x15 && uint8[i + 1] === 0x49 && 
          uint8[i + 2] === 0xA9 && uint8[i + 3] === 0x66) {
        infoOffset = i;
        break;
      }
    }

    if (infoOffset === -1) {
      console.warn('Info element not found');
      return blob;
    }

    // Search for Duration element (0x4489) after Info
    let durationOffset = -1;
    for (let i = infoOffset; i < Math.min(infoOffset + 500, uint8.length - 10); i++) {
      if (uint8[i] === 0x44 && uint8[i + 1] === 0x89) {
        durationOffset = i;
        break;
      }
    }

    if (durationOffset === -1) {
      console.warn('Duration element not found');
      return blob;
    }

    // Read size byte (EBML variable-size encoding)
    const sizeOffset = durationOffset + 2;
    const sizeByte = uint8[sizeOffset];
    
    let dataSize = 0;
    let dataOffset = sizeOffset + 1;
    
    if ((sizeByte & 0x80) === 0x80) {
      dataSize = sizeByte & 0x7F;
    } else if ((sizeByte & 0x40) === 0x40) {
      dataSize = ((sizeByte & 0x3F) << 8) | uint8[sizeOffset + 1];
      dataOffset = sizeOffset + 2;
    }

    // Create copy and write duration
    const newUint8 = new Uint8Array(uint8);
    const view = new DataView(newUint8.buffer);

    if (dataSize === 8) {
      view.setFloat64(dataOffset, durationMs, false);
    } else if (dataSize === 4) {
      view.setFloat32(dataOffset, durationMs, false);
    } else {
      console.warn('Unexpected duration size:', dataSize);
      return blob;
    }

    console.log(`✅ Fixed WebM duration to ${durationMs}ms`);
    return new Blob([newUint8], { type: blob.type });

  } catch (error) {
    console.error('Error fixing WebM duration:', error);
    return blob;
  }
}
