<template>
  <div>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Book Details</h3>
          </div>
          <div class="modal-body">
            <slot name="body">
              <h3>{{ bookData.name }}</h3>
              <h4>Price: {{ bookData.price }}</h4>
              <p>
                Description: {{ bookData.description }}<br />
                Owner: {{ bookData.owner }}
              </p>
              <div
                v-if="bookData.available && userData.address != bookData.owner"
              >
                <button
                  v-on:click="buyBook"
                  class="btn btn-primary float-right"
                >
                  Buy Now
                </button>
              </div>
              <button
                v-else-if="userData.address == bookData.owner"
                class="btn btn-danger float-right"
                v-on:click="deleteBook"
              >
                Delete
              </button>
              <button
                class="btn btn-outline-secondary float-right mr-3"
                v-on:click="userInteractionCompleted"
              >
                Cancel
              </button>
            </slot>

            <pulse-loader :loading="loading"></pulse-loader>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Datepicker from 'vue3-datepicker'
import mixin from '../libs/mixinSmartContracts'
import createNFTMetaDataURIViaPinata from '../libs/createNFTMetaDataURI'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  mixins: [mixin],
  components: {
    Datepicker,
    PulseLoader,
  },
  props: ['bookData', 'userData'],
  data() {
    return {
      loading: false,
      timestamp: 0,
      tmoConn: null, // contain the intervalID given by setInterval
    }
  },
  methods: {
    deleteBook() {
      this.invokeSmartContract('Bookstore', 'deleteBook', this.getContractInfo)
    },
    buyBook() {
      this.loading = true
      this.createNFTMetaDataURI().then((tokenMetaDataURI) => {
        console.log(`tokenMetaDataURI: ${JSON.stringify(tokenMetaDataURI)}`)
        this.bookData.tokenMetaDataURI = tokenMetaDataURI
        this.loading = false
        this.invokeSmartContract(
          'Bookstore',
          'buyBook',
          this.getContractInfo,
          (error, _txnInfo) => {
            if (error) {
              console.error(error)
            }
          },
        )
      })
    },
    createNFTMetaDataURI() {
      this.timestamp = Math.round(new Date().getTime() / 1000)

      const nftData = {
        receiverAddress: this.userData.address,
        metaData: {
          name: this.bookData.name,
          description: this.bookData.description,
          attributes: [
            {
              trait_type: 'bookId',
              value: this.bookData.id,
            },
            {
              trait_type: 'buyer',
              value: this.bookData.address,
            },
            {
              trait_type: 'timestamp',
              value: new Date(this.timestamp * 1000).toUTCString(),
            },
          ],
        },
      }
      console.log(`nftData: ${JSON.stringify(nftData)}`)
      return new Promise((resolve, reject) => {
        createNFTMetaDataURIViaPinata(nftData, (result) => {
          resolve(result)
        }).catch((error) => {
          console.error(error)
          reject(error)
        })
      })
    },
    getContractInfo(contractName, method) {
      const address = this.userData.address
      const bookId = this.bookData.id
      console.log(`getContractInfo - bookId: ${bookId}`)

      const bookstoreContract = window.bc.contract(contractName)
      let value = undefined
      if (method == 'deleteBook') {
        method = bookstoreContract.methods[method](bookId)
      } else {
        value = this.bookData.priceWei
        console.log(`getContractInfo - value: ${value}`)

        method = bookstoreContract.methods[method](
          bookId,
          this.timestamp,
          this.bookData.tokenMetaDataURI,
        )
      }
      return { contract: bookstoreContract, bookId, method, value, address }
    },
  },
}
</script>

<style></style>
