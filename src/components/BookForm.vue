<template>
  <div>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Sell Your Book</h3>
          </div>

          <div class="modal-body">
            <slot name="body">
              <div class="form-group">
                <label for="title">Book Name</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="title"
                  placeholder="Enter Book Name"
                />
              </div>
              <div class="form-group">
                <label for="description">Description</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="description"
                  placeholder="Description"
                />
              </div>
              <div class="form-group">
                <label for="price">Price</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="price"
                  :placeholder="priceUnit"
                />
              </div>
              <button v-on:click="sellBook" class="btn btn-primary float-right">
                Submit
              </button>
              <button
                class="btn btn-outline-secondary float-right mr-3"
                v-on:click="userInteractionCompleted"
              >
                Cancel
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from '../libs/mixinSmartContracts'

export default {
  mixins: [mixin],
  props: ['userData'],
  data() {
    return {
      title: '',
      description: '',
      price: '',
      priceUnit: `Unit: ${window.bc.info.currencySymbol}`,
    }
  },
  methods: {
    getContractInfo(contractName, method) {
      const address = this.userData.address
      const bookstoreContract = window.bc.contract(contractName)
      method = bookstoreContract.methods[method](
        this.title,
        this.description,
        window.bc.etherToWei(this.price),
      )
      return { contract: bookstoreContract, method, address }
    },
    sellBook() {
      this.invokeSmartContract('Bookstore', 'sellBook', this.getContractInfo)
    },
  },
}
</script>

<style></style>
