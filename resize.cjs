const fs = require('fs');
const { Jimp } = require('jimp');

async function main() {
    try {
        if (!fs.existsSync('build')) fs.mkdirSync('build');
        if (!fs.existsSync('assets')) fs.mkdirSync('assets');

        // Read the source logo
        const image = await Jimp.read('logo-baru.jpg');

        // Create a 512x512 white background
        const bg = new Jimp({ width: 512, height: 512, color: 0xffffffff });

        // Resize the logo to fit within 440x440, maintaining aspect ratio
        image.contain({ w: 440, h: 440 });

        const x = Math.floor((512 - image.width) / 2);
        const y = Math.floor((512 - image.height) / 2);
        bg.composite(image, x, y);

        await bg.write('build/icon.png');
        await bg.write('assets/icon.png');
        console.log('Successfully created square icon.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
