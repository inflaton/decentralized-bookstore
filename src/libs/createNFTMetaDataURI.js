const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY

import pinataSDK from '@pinata/sdk'
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY)

const createNFTMetaDataURI = async function (nftData, callback) {
  const nftMetaData = nftData.metaData
  //Call Pinata to get NFT metadata uri
  const options = {
    pinataMetadata: {
      name: nftMetaData.name,
    },
    pinataOptions: {
      cidVersion: 0,
    },
  }
  if (!nftMetaData.image) {
    nftMetaData.image = import.meta.env.VITE_BOOK_NFT_ENDPOINT
  }

  console.log(nftMetaData)

  pinata
    .pinJSONToIPFS(nftMetaData, options)
    .then((result) => {
      //handle results here
      console.log(`pinJSONToIPFS:\n${JSON.stringify(result, 0, 2)}`)
      const uri = 'ipfs://' + result.IpfsHash
      callback(uri)
    })
    .catch((err) => {
      //handle error here
      console.error(err)
      throw err
    })
}

export default createNFTMetaDataURI
