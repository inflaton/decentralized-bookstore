<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <ul class="navbar-nav">
      <li class="nav-link">
        <strong :class="connectedClass">
          {{
            bcConnected ? `Connected to ${this.networkName}` : 'Not Connected'
          }}
        </strong>
      </li>
    </ul>
    <!--
    <ul class="navbar-nav">     
      <li class="nav-link">
         <router-link to="/connect"><strong :class="connectedClass">
          {{
            bcConnected ? `Connected to ${this.networkName}` : "Not Connected"
          }}
        </strong></router-link>
      </li>
      <li class="nav-link">
         <router-link to="/"><strong :class="connectedClass">
          Home
        </strong></router-link>
      </li>
    </ul>
    -->
    <transaction-modal
      v-if="showModal"
      :transactionData="transactionObject"
      @completed="onCompleted"
    />
    <transaction-modal
      v-if="showModalConfirmed"
      :transactionData="transactionObject"
      @completed="onCompletedConfirmed"
    />
  </nav>
</template>

<script>
// importing common function
import mixin from '../libs/mixinViews'
import transactionModal from '../components/transactionModal.vue'

export default {
  mixins: [mixin],

  data() {
    return {
      tmoConn: null, // contain the intervalID given by setInterval
      tmoReg: null, // contain the intervalID given by setInterval
      connectedClass: 'text-danger', // bootstrap class for the connection status (red when not connected, green when connected)
      showModal: false,
      showModalConfirmed: false,
      transactionObject: {},
    }
  },

  components: {
    transactionModal,
  },

  methods: {
    round(value) {
      const decimals = 3
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
    },

    showTransactionDetails(txnInfo) {
      this.transactionObject.contract = txnInfo.contract
      this.transactionObject.txHash = txnInfo.txHash
      this.transactionObject.status = txnInfo.status
      this.transactionObject.tokenId = txnInfo.tokenId
      this.transactionObject.tokenAddress = txnInfo.tokenAddress

      if (txnInfo.status == 'Confirmed') {
        this.transactionObject.submissionDuration = this.round(
          (txnInfo.perf.t1 - txnInfo.perf.t0) / 1000,
        )
        this.transactionObject.confirmationDuration = this.round(
          (txnInfo.perf.t2 - txnInfo.perf.t1) / 1000,
        )
        this.showModal = false
        const This = this
        setTimeout(() => (This.showModalConfirmed = true), 100)
      } else {
        this.showModal = true
        this.showModalConfirmed = false
      }
    },
    onCompleted() {
      this.showModal = false
    },
    onCompletedConfirmed() {
      this.showModalConfirmed = false
    },
    checkBlockchainIsConnected() {
      this.tmoConn = setInterval(() => {
        // checking first if the connection with the blockchain is established
        if (this.blockchainIsConnected()) {
          // stopping the setInterval
          clearInterval(this.tmoConn)

          // showing the connected message on the top bar and setting the class too
          this.connectedClass = 'text-success'
        }
      }, 500)
    },
  },

  created() {
    this.$Event.on('transaction_event', this.showTransactionDetails)
    this.checkBlockchainIsConnected()
  },
}
</script>

<style></style>
