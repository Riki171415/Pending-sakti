// Creates a proper multi-size .ico file from a 512x512 PNG
const fs = require('fs');
const { Jimp } = require('jimp');

const SIZES = [16, 32, 48, 64, 128, 256];

async function main() {
    const src = await Jimp.read('build/icon.png');
    const entries = [];

    for (const size of SIZES) {
        const resized = src.clone().resize({ w: size, h: size });
        // Get raw RGBA pixel data
        const bitmap = resized.bitmap;
        const width = bitmap.width;
        const height = bitmap.height;
        const bpp = 32;
        const rowBytes = width * 4;
        // BMP rows are bottom-up
        const pixelData = Buffer.alloc(rowBytes * height);
        for (let y = 0; y < height; y++) {
            const srcRow = y * rowBytes;
            const dstRow = (height - 1 - y) * rowBytes;
            for (let x = 0; x < width; x++) {
                // RGBA -> BGRA
                pixelData[dstRow + x * 4 + 0] = bitmap.data[srcRow + x * 4 + 2]; // B
                pixelData[dstRow + x * 4 + 1] = bitmap.data[srcRow + x * 4 + 1]; // G
                pixelData[dstRow + x * 4 + 2] = bitmap.data[srcRow + x * 4 + 0]; // R
                pixelData[dstRow + x * 4 + 3] = bitmap.data[srcRow + x * 4 + 3]; // A
            }
        }

        // BITMAPINFOHEADER (40 bytes)
        const header = Buffer.alloc(40);
        header.writeUInt32LE(40, 0);           // biSize
        header.writeInt32LE(width, 4);          // biWidth
        header.writeInt32LE(height * 2, 8);     // biHeight (doubled for AND mask)
        header.writeUInt16LE(1, 12);            // biPlanes
        header.writeUInt16LE(bpp, 14);          // biBitCount
        header.writeUInt32LE(0, 16);            // biCompression
        header.writeUInt32LE(pixelData.length, 20); // biSizeImage
        // rest are 0

        const andMaskRowBytes = Math.ceil(width / 8);
        const andMaskPaddedRowBytes = Math.ceil(andMaskRowBytes / 4) * 4;
        const andMask = Buffer.alloc(andMaskPaddedRowBytes * height, 0);

        const data = Buffer.concat([header, pixelData, andMask]);
        entries.push({ width: width >= 256 ? 0 : width, height: height >= 256 ? 0 : height, data });
    }

    // ICO header: 6 bytes
    const icoHeader = Buffer.alloc(6);
    icoHeader.writeUInt16LE(0, 0);              // reserved
    icoHeader.writeUInt16LE(1, 2);              // type (1 = ICO)
    icoHeader.writeUInt16LE(entries.length, 4);  // count

    // Directory entries: 16 bytes each
    const dirSize = entries.length * 16;
    const directory = Buffer.alloc(dirSize);
    let dataOffset = 6 + dirSize;

    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const off = i * 16;
        directory.writeUInt8(e.width, off + 0);
        directory.writeUInt8(e.height, off + 1);
        directory.writeUInt8(0, off + 2);        // color palette
        directory.writeUInt8(0, off + 3);        // reserved
        directory.writeUInt16LE(1, off + 4);     // planes
        directory.writeUInt16LE(32, off + 6);    // bpp
        directory.writeUInt32LE(e.data.length, off + 8);  // size
        directory.writeUInt32LE(dataOffset, off + 12);     // offset
        dataOffset += e.data.length;
    }

    const allData = Buffer.concat([icoHeader, directory, ...entries.map(e => e.data)]);
    fs.writeFileSync('build/icon.ico', allData);
    console.log('ICO created with sizes:', SIZES.join(', '));
}

main().catch(err => { console.error(err); process.exit(1); });
