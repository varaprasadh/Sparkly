const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const buildFolderPath = path.join(__dirname, 'dist'); // Path to your build folder
const outputZipPath = path.join(__dirname, 'extension.zip'); // Path where the ZIP file will be created

function createZip() {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputZipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level
        });

        output.on('close', () => {
            console.log(`ZIP file has been created: ${outputZipPath} (${archive.pointer()} total bytes)`);
            resolve();
        });

        output.on('end', () => {
            console.log('Data has been drained');
        });

        archive.on('warning', (err) => {
            if (err.code !== 'ENOENT') {
                reject(err);
            }
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        archive.directory(buildFolderPath, false);

        archive.finalize();
    });
}

module.exports = {
    createZip
};
