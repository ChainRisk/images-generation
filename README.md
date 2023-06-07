# ChainRisk NFT Generation Service

ChainRisk NFT generation service is a revolutionary application that generates and mints Non-Fungible Tokens (NFTs) representing credit scores. This application is an exciting use of blockchain and NFTs, offering a novel way to represent credit scores in the context of decentralized finance (DeFi) applications.

## Key Libraries

The application leverages several npm libraries:

- **axios** (v1.4.0): Used for making HTTP requests.
- **canvas** (v2.11.2): Used to create and manipulate image data representing the credit score.
- **date-fns** (v2.30.0): Used for date manipulation functions.
- **express** (v4.18.2): Used as the web application framework.
- **jimp** (v0.22.8): Used to manipulate images.
- **mime** (v3.0.0): Used to determine MIME types of the data.
- **nft.storage** (v7.1.0): Used to store the minted NFTs.

## Installation

To set up the application:

Install the dependencies: `npm install`

## Usage

Start the application: `npm start`

## Endpoints
The application has two main endpoints: `POST /image` and `GET /image`. Both of these endpoints create an image representation of a credit score and mint it as an NFT.

### `POST /image`:

This endpoint allows you to generate a new NFT with credit rating information. The **request body** should be a JSON object with the following key-value pairs:

- **address (optional)**: A string representing an address. If not provided, 'Address not provided' is used.

The endpoint responds with the stored NFT's data.

### `GET /image`:

This endpoint allows you to generate a new NFT with credit rating information based on the provided address **query parameter**.

- **address (optional)**: A string representing an address. If not provided, 'Address not provided' is used.

The endpoint responds with the stored NFT's data.

### Request/Response Process:

1. A client sends a request to the application with a wallet address.
2. The application fetches the credit score associated with that address.
3. The credit score is used to create an image representation of the credit score using the canvas library. The image includes a dynamic color scaling system where the colors change depending on the score's value.
4. The application mints an NFT representing the credit score using the nft.storage library. The NFT includes the image and metadata such as the blended score, credit rating, mint date, and expiration date.
5. The NFT is returned to the client in the response.

This application is part of a broader system where these NFTs are used for creditworthiness assessments in DeFi applications.
