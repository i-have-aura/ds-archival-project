const https = require('https');
const fs = require('fs');
const path = require('path');

const textures = [
    'tree2abark', 'treeblog', 'wood_seamless2', 'mushroom2', 'rock1', 'yellowtopwall',
    'Rock7', 'FlourescentLight1', 'flowerpatchgreen', 'flowerpatchyellow', 'flowerpatchwhite',
    'agaricus_dulcidulus_mushroom_17_10_06_3', 'Canister1', 'mushroom1', 'corrugatediron1',
    'glass2solid', 'metalplate', 'HazardStripeSolid1', 'wheel1', 'fan1', 'bin1', 'bin2',
    'wheel2', 'crackedglass1', 'keypad1', 'concretetile', 'concrete2', 'cleanWood', 'truckstuff',
    'plant02', 'a', 'metal1', 'redmushroom', '6bd0da5e_dds', 'cratetex1', 'bluecontainermat',
    'oldWood', 'concrete4', 'darkconcrete1', 'moss1', 'dirt1', 'basicPlank', 'plastic1',
    '02-Default', 'metalplates1', 'log_texture', 'Sandygravel01', 'weed3',
    'mossedgetransiIelwEQyuVx', 'weed1', 'bamboobranch', 'weed4', 'leaf2textures', 'weed2',
    'glass1', 'forestfloor1', 'vines1', 'HazardStripe1', 'fern1', 'weed5'
];

const BASE_URL = 'put the asset url here';
const OUT_DIR = './textures';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

function download(name) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${name}.webp`;
        const dest = path.join(OUT_DIR, `${name}.webp`);
        const file = fs.createWriteStream(dest);

        https.get(url, res => {
            if (res.statusCode !== 200) {
                fs.unlinkSync(dest);
                return reject(`${name}: HTTP ${res.statusCode}`);
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(name); });
        }).on('error', err => {
            fs.unlinkSync(dest);
            reject(`${name}: ${err.message}`);
        });
    });
}

(async () => {
    for (const name of textures) {
        try {
            await download(name);
            console.log(`✓ ${name}`);
        } catch (e) {
            console.error(`✗ ${e}`);
        }
    }
    console.log('Done!');
})();