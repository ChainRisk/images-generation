const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const app = express();
const bodyParser = require('body-parser');
const { NFTStorage } = require('nft.storage');
const { Blob } = require("buffer");
const cors = require('cors')
const port = process.env.PORT || 3000;
const { NFT_STORAGE_KEY } = require('./secret');
const {fromUnixTime, addMonths, getUnixTime} = require("date-fns");

app.use(cors());
app.use(bodyParser.json());

registerFont('assets/Figtree/static/Figtree-Black.ttf', { family: 'Figtree Black' });
registerFont('assets/Figtree/static/Figtree-Regular.ttf', { family: 'Figtree' });

const orange50 = '#FFFAF0';
const orange100 = '#FEEBC8';
const orange500 = '#DD6B20';

const green50 = '#F0FFF4';
const green100 = '#C6F6D5';
const green500 = '#38A169';

const red50 = '#FFF5F5';
const red100 = '#FED7D7';
const red500 = '#E53E3E';

async function storeNFT(imageBuffer, name, description, attributes) {
    // const image = await fileFromPath(imagePath)

    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    const imageBlob = new Blob([imageBuffer], { type: 'image/*' });

    // call client.store, passing in the image & metadata
    return nftstorage.store({
        image: imageBlob,
        name,
        description,
        attributes,
    })
}

app.post('/image', async (req, res) => {
    const mintDate = getUnixTime(new Date());
    const expiryDate = getUnixTime(addMonths(new Date(), 3));
    const score = req.body.score;
    const creditRating = req.body.creditRating;
    const address = req.body.address || 'Address not provided';

    // Validation
    if (score < 0 || score > 100 || isNaN(score)) {
        res.status(400).send('Score must be a number between 0 and 100');
        return;
    }

    // Creating a new canvas
    const canvas = createCanvas(1200, 620);
    const ctx = canvas.getContext('2d');

    // Scale colors from red to green depending on the score
    const bgColor = score <= 35 ? red50 : score <= 65 ? orange50 : green50;
    const color = score <= 35 ? red500 : score <= 65 ? orange500 : green500;
    const lightColor = score <= 35 ? red100 : score <= 65 ? orange100 : green100;

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

    function getRandomBetween(min, max) {
        if(max < min) {
            throw new Error("Max must be greater than or equal to min.");
        }
        return Math.random() * (max - min) + min;
    }

    function drawBackground() {
        ctx.fillStyle = bgColor; // change to your desired background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawPath(points) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            let cp = points[i];
            let np = i < points.length - 1 ? points[i + 1] : points[0];
            ctx.quadraticCurveTo(cp.x, cp.y, (cp.x + np.x) / 2, (cp.y + np.y) / 2);
        }

        ctx.closePath();
        ctx.fillStyle = lightColor; // blob color
        ctx.fill();
    }

    function getCirclePoints(base, radius, segments) {
        const positions = [];
        const randomRange = radius * 0.4; // vary control points up to 40% of the radius

        for (let i = 0; i < segments; i++) {
            const angle = (i * Math.PI * 2) / segments;
            const r = radius + getRandomBetween(-randomRange, randomRange);
            positions.push({
                x: base.x + r * Math.sin(angle),
                y: base.y + r * Math.cos(angle)
            });
        }

        return positions;
    }

    drawBackground();
    drawPath(getCirclePoints({ x: 800, y: 1300 }, 1000, 20));
    randomDashes(ctx, 12, 1600, 1600, lightColor);

    // Draw the score onto the image
    ctx.font = '200px Figtree Black';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(creditRating, canvas.width / 2, canvas.height / 2 - 100);

    // Draw description under the score
    ctx.font = '34px Figtree';
    ctx.fillStyle = color;
    ctx.fillText(`Blended credit score of ${score}`, canvas.width / 2, canvas.height / 2 + 40);


    // Draw Mint Date at the bottom of the image
    ctx.font = '24px Figtree';
    ctx.fillStyle = color;
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Mint date: ${fromUnixTime(mintDate).toDateString()}`, 120, canvas.height - 140);

    // Draw Expiry Date at the bottom of the image
    ctx.font = '24px Figtree';
    ctx.fillStyle = color;
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Expiration date: ${fromUnixTime(expiryDate).toDateString()}`, 120, canvas.height - 110);


    // Draw ID at the bottom of the image
    ctx.font = '34px Figtree';
    ctx.fillStyle = color;
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${address}`, 120, canvas.height - 60);

    // Return the image
    const imageBuffer = canvas.toBuffer();

    // res.set('Content-Type', 'image/png');
    // res.send(imageBuffer);

    const nftRes = await storeNFT(imageBuffer, 'RiskPass', `This is your RiskPass, a way to show your creditworthiness`, [
        {
            "display_type": "number",
            "trait_type": "blendedScore",
            "value": score
        },
        {
            "trait_type": "creditRating",
            "value": creditRating
        },
        {
            "display_type": "date",
            "trait_type": "Mint date",
            "value": mintDate
        },
        {
            "display_type": "date",
            "trait_type": "Expiration date",
            "value": expiryDate
        },
    ]);

    res.set('Content-Type', 'application/json');
    res.send(nftRes);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
