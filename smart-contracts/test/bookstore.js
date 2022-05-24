var Bookstore = artifacts.require('./Bookstore.sol')

contract('Bookstore', function (accounts) {
  var instance = null // store the Bookstore contract instance
  var mainAccount = accounts[0]
  var latestBookId

  it('should add a book', function () {
    var booksBeforeRegister = null

    return Bookstore.deployed()
      .then(function (contractInstance) {
        // storing the contract instance so it will be used later on
        instance = contractInstance

        // calling the smart contract function totalBookstore to get the current number of bookstore
        return instance.bookId.call()
      })
      .then(function (result) {
        // storing the current number on the var booksBeforeRegister
        booksBeforeRegister = result.toNumber()

        return instance.sellBook(
          'Test Book Name',
          'Test Description',
          2000000000000000,
          {
            from: mainAccount,
          },
        )
      })
      .then(function (_result) {
        return instance.totalBooks.call(true)
      })
      .then(function (result) {
        console.log(`allBooks: ${result}`)
        const booksAfterRegister = result.length
        // checking if the total number of user is increased by 1
        assert.equal(
          booksAfterRegister,
          booksBeforeRegister + 1,
          'number of books must be (' + booksBeforeRegister + ' + 1)',
        )
        latestBookId = booksAfterRegister - 1
      })
  })

  it('book details in the blockchain should be the same the one gave on sellBook', function () {
    // NOTE: the contract instance has been instantiated before, so no need
    // to do again: return Bookstore.deployed().then(function(contractInstance) { ...
    // like before in last test case.
    return instance.books.call(latestBookId).then(function (result) {
      console.log(`result: ${JSON.stringify(result)}`)

      assert.equal(result[1], 'Test Book Name')
      assert.equal(result[2], 'Test Description')
      assert.equal(result[3], true) // valid
      assert.equal(result[4], 2000000000000000)
      assert.equal(result[5], mainAccount) // owner
    })
  }) // end testing username and email

  it('should buy a book', function () {
    return Bookstore.deployed()
      .then(function (contractInstance) {
        // storing the contract instance so it will be used later on
        instance = contractInstance

        return instance.buyBook(
          latestBookId,
          1653362279,
          'ipfs://QmRvYy1zfqh43j1p5QTGKcQVSzFbQYmRcHXawBp8DwdNRX',
          {
            from: mainAccount,
          },
        )
      })
      .then(function (result) {
        console.log(`buyBooks: ${JSON.stringify(result, 0, 2)}`)
        assert.equal(
          result.receipt.from.toLowerCase(),
          mainAccount.toLowerCase(),
          'buyBook failed',
        )
      })
  })
}) // end Bookstore contract
