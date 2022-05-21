<template>
  <div>
    <button class="btn btn-warning float-right mt-2" @click="reloadList">
      Reload
    </button>
    <button class="btn btn-primary float-right mt-2" @click="toggle">
      Sell Book
    </button>
    <h2 class="title">Book List</h2>
    <hr />

    <!-- <div class="clearfix"></div> -->

    <h2 v-show="!bcConnected">Not connect to the blockchain: please wait.</h2>

    <h2 v-show="isLoading && bcConnected">Loading...</h2>
    <div class="row" v-show="!isLoading">
      <div
        class="m-3"
        v-for="(book, i) in books"
        v-bind:key="'book' + book.id + i"
      >
        <card
          :bookObject="book"
          :userObject="getUserObject()"
          @reloadList="reloadList"
        />
      </div>
    </div>
    <book-form
      v-if="showModal"
      :userData="getUserObject()"
      @userInteractionCompleted="onUserInteractionCompleted"
    />
  </div>
</template>

<script>
// importing common function
import mixin from '../libs/mixinViews'
import card from '../components/card.vue'
import bookForm from '../components/bookForm.vue'

/**
 * List view component: this component shows list of the registered books
 * and their statuses.
 */
export default {
  mixins: [mixin],

  components: {
    card,
    bookForm,
  },

  data() {
    return {
      showModal: false,
      address: null,
      lastTotal: 0,
      books: [], // array that stores all the registered books
      isLoading: true, // true when the book list is loading form the blockchain
      bcConnected: false, // blockchain is connected ()
      tmoConn: null, // contain the intervalID given by setInterval
    }
  },

  methods: {
    onTransactionEvent(txnInfo) {
      console.log(`onTransactionEvent: ${JSON.stringify(txnInfo)}`)
      if (
        txnInfo.contract.name == 'Bookstore' &&
        txnInfo.status == 'Confirmed'
      ) {
        if (txnInfo.contract.method == 'sellBook') {
          this.getBook(txnInfo.bookId, this.onBookLoaded)
        } else {
          for (let i = 0; i < this.books.length; i++) {
            const book = this.books[i]
            if (book.id == txnInfo.bookId) {
              if (txnInfo.contract.method == 'deleteBook') {
                this.books.splice(i, 1)
              } else {
                // book.available = false
              }
              break
            }
          }
        }
      }
    },
    getUserObject() {
      return {
        address: this.address,
      }
    },

    /**
     * Get the list of the registered books once the connection to the
     * blockchain is established.
     */
    getBookList() {
      if (this.blockchainIsConnected()) {
        // it shows the loading message
        this.isLoading = true

        // stopping the interval
        clearInterval(this.tmoConn)

        window.bc.getMainAccount().then((address) => {
          this.address = address
          this.getAllBooks(this.onBookLoaded)
        })
      }
    },
    onBookLoaded(book) {
      book = {
        id: book[0],
        name: book[1],
        description: book[2],
        available: book[3],
        priceWei: book[4],
        price: window.bc.weiToEtherStr(book[4]),
        owner: book[5],
        address: this.address,
      }
      let i
      for (i = 0; i < this.books.length; i++) {
        const element = this.books[i]
        if (book.id < element.id) {
          this.books.splice(i, 0, book)
          break
        }
      }
      if (i == this.books.length) {
        this.books.push(book)
      }
    },
    /**
     * It reloads the book list.
     */
    reloadList() {
      this.books = []
      this.getBookList()
    },

    toggle() {
      this.showModal = !this.showModal
    },

    onUserInteractionCompleted(e) {
      console.log(`onUserInteractionCompleted: ${JSON.stringify(e)}`)
      this.toggle()
    },

    getBook(id, callback) {
      const bookstoreContract = window.bc.contract('Bookstore')
      bookstoreContract.methods
        .books(id)
        .call()
        .then((book) => {
          console.log(`book ${id}: ${JSON.stringify(book)}`)
          // filter the deleted books
          const name = book[0]
          if (name && name != '') {
            callback(book)
          }
        })
        .catch((err) => {
          console.log('books error:', err)
        })
    },

    /**
     * Get all books.
     */
    getAllBooks(callback) {
      const bookstoreContract = window.bc.contract('Bookstore')
      // getting the total number of books stored in the blockchain
      // calling the method totalBooks from the smart contract
      bookstoreContract.methods
        .totalBooks(true)
        .call()
        .then((books) => {
          const total = books.length
          console.log('total books:', total)
          this.lastTotal = total
          this.isLoading = false

          if (total > 0) {
            // getting the book one by one
            for (var i = 0; i < total; i++) {
              const book = books[i]
              callback(book)
            } // end for
          }
        })
        .catch((err) => {
          console.log('totalBooks error:', err)
          this.$Event.emit('smart_contract_error', err)
        })
    },
  }, // end methods

  created() {
    this.$Event.on('transaction_event', this.onTransactionEvent)

    // it tries to get the book list from the blockchain once
    // the connection is established
    this.tmoConn = setInterval(() => {
      this.getBookList()
    }, 500)
  },
}
</script>

<style></style>
