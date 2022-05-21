<template>
  <div>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Transaction {{ transactionData.status }}</h3>
          </div>
          <div class="modal-body">
            <slot name="body">
              <h3>Contract Name: {{ transactionData.contract.name }}</h3>
              <h3>Contract Method: {{ transactionData.contract.method }}</h3>
              <p>
                Transaction Details:
                <a
                  :href="transactionUrl(transactionData.txHash)"
                  target="_blank"
                >
                  {{ displayableTxHash(transactionData.txHash) }}</a
                >
                <br />
              </p>
              <p v-if="transactionData.status == 'Submitted'">
                Transaction has been initiated. Waiting for confirmation ...
              </p>
              <p v-else>
                Submission:
                {{ transactionData.submissionDuration }} seconds<br />
                Confirmation:
                {{ transactionData.confirmationDuration }} seconds<br />
              </p>

              <h4 v-if="transactionData.tokenId">Minted NFT</h4>
              <p v-if="transactionData.tokenId">
                Address: <small>{{ transactionData.tokenAddress }}</small>
                <br />
                Token ID:
                {{ transactionData.tokenId }} <br />
              </p>

              <button
                class="btn btn-outline-secondary float-right mr-3"
                v-on:click="closeModal"
              >
                Close
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['transactionData'],
  methods: {
    closeModal(_e) {
      this.$emit('completed')
    },
    displayableTxHash(txHash) {
      return txHash.slice(0, 10) + '...' + txHash.slice(-6)
    },
    transactionUrl(txHash) {
      return window.bc.getTransactionUrl(txHash)
    },
  },
}
</script>

<style></style>
