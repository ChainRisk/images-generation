require('dotenv').config();
const express = require('express');
const { createCanvas } = require('canvas');
const app = express();
const bodyParser = require('body-parser');
const { NFTStorage } = require('nft.storage');
const { Blob } = require("buffer");
const cors = require('cors')
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;

const orange50 = '#FFFAF0';
const orange100 = '#FEEBC8';
const orange500 = '#DD6B20';

const green50 = '#F0FFF4';
const green100 = '#C6F6D5';
const green500 = '#38A169';

const red50 = '#FFF5F5';
const red100 = '#FED7D7';
const red500 = '#E53E3E';

async function storeNFT(imageBuffer, name, description) {
    // const image = await fileFromPath(imagePath)

    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    const imageBlob = new Blob([imageBuffer], { type: 'image/*' });

    // call client.store, passing in the image & metadata
    return nftstorage.store({
        image: imageBlob,
        name,
        description,
    })
}

app.post('/image', async (req, res) => {
    const score = req.body.score;
    const id = req.body.id || 'ID not provided';

    // Validation
    if (score < 0 || score > 100 || isNaN(score)) {
        res.status(400).send('Score must be a number between 0 and 100');
        return;
    }

    // Creating a new canvas
    const canvas = createCanvas(800, 1200);
    const ctx = canvas.getContext('2d');

    // Scale colors from red to green depending on the score
    const bgColor = score < 33 ? red50 : score < 66 ? orange50 : green50;
    const color = score < 33 ? red500 : score < 66 ? orange500 : green500;
    const lightColor = score < 33 ? red100 : score < 66 ? orange100 : green100;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function randomDashes(ctx, count, minLength, maxLength, color) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.width - canvas.width/2;
            const y = Math.random() * canvas.height - canvas.height/2;
            const length = Math.random() * (maxLength - minLength) + minLength;
            const angle = Math.random() * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }

    randomDashes(ctx, 12, 1600, 1600, lightColor);

    // Draw the score onto the image
    ctx.font = '340px Arial Black';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score, canvas.width / 2, canvas.height / 2 - 200);

    // Draw description under the score
    ctx.font = '34px Arial';
    ctx.fillStyle = color;
    ctx.fillText(`blended credit score of ${score}`, canvas.width / 2, canvas.height / 2);

    // Draw ID at the bottom of the image
    ctx.font = '34px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ID: ${id}`, canvas.width / 2, canvas.height - 60);

    // Return the image
    const imageBuffer = canvas.toBuffer();

    const nftRes = await storeNFT(imageBuffer, 'Blended Credit Score', `Blended credit score of ${score} for ID ${id}`);

    res.set('Content-Type', 'application/json');
    res.send(nftRes);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
