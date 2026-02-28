import Jimp from 'jimp';
import pngToIco from 'png-to-ico';
import fs from 'fs';

async function convert() {
    try {
        const image = await Jimp.read('public/icon.png');
        await image.resize(256, 256).writeAsync('build/icon-256.png');
        const buf = await pngToIco('build/icon-256.png');
        fs.writeFileSync('build/icon.ico', buf);
        console.log('Icon converted successfully!');
    } catch (err) {
        console.error('Error:', err);
    }
}

convert();
