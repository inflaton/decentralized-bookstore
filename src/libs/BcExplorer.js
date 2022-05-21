import Web3 from 'web3'
import Chains from '../assets/Chains.json'

class BcExplorer {
  constructor() {
    this.web3inst = null // store the web3 instance
    this.contractInst = {} // store the smart contract instance
    this.contractAddr = {} // store the smart contract instance

    // general info about connection and user information
    this.info = {
      isConnected: false,
      networkId: 0,
      coinbase: null,
      mainAccount: null,
      balance: 0,
      addressUrl: null,
      currencySymbol: 'ETH',
      chainInfo: null,
    }
  }

  /**
   * Initialize the Web3 instance.
   *
   * @param {string} addressUrl Provider address URL like http://127.0.0.1:7545
   * @return {Promise}
   */
  init(addressUrl) {
    return new Promise((resolve, reject) => {
      if (this.web3inst) {
        resolve(this.web3inst)
      }
      // checking if the provider is already set by mist or metamask
      else if (window.ethereum) {
        const web3 = new Web3(ethereum)

        try {
          // Request account access if needed
          ethereum
            .request({ method: 'eth_requestAccounts' })
            .then((accounts) => {
              console.log(
                `eth_requestAccounts - accounts: ${JSON.stringify(accounts)}`,
              )
              this.setWeb3(web3, addressUrl).then(() => {
                resolve(web3)
              })
            })
            .catch((error) => reject(error))
        } catch (error) {
          reject(error)
        }
      } else {
        console.log(`addressUrl: ${addressUrl}`)
        if (typeof addressUrl == 'undefined') {
          reject(new Error('BcExplorer error: impossible to connect.'))
        } else {
          // set the provider you want from Web3.providers
          var provider = new Web3.providers.HttpProvider(addressUrl)
          const web3js = new Web3(provider)
          this.setWeb3(web3js, addressUrl).then(() => {
            resolve(web3js)
          })
        }
      }
    })
  }

  /**
   * Set the Web3 instance and general information.
   *
   * @param {Object} web3js web3 instance
   * @param {string} addressUrl Provider address URL like http://127.0.0.1:7545
   * @return {void}
   */
  async setWeb3(web3js, addressUrl) {
    this.info.addressUrl = addressUrl
    this.web3inst = web3js
    await this.loadInfo()

    if (
      this.info.currencySymbol === 'MTR' ||
      this.info.currencySymbol === 'ARETH'
    ) {
      this.info.isConnected = true
    } else {
      this.info.isConnected = await this.web3inst.eth.net
        .isListening()
        .then((res) => {
          console.log(`web3.eth.net.isListening(): ${res}`)
          return res
        })
    }
  }

  /**
   * Initialize a smart contract from the compiled JSON.
   * The compiledContractJson parameter is the JSON of the smart contract settings
   * that you can find in the folder /build/contracts/YourContract.json after
   * the migration.
   *
   * @param {Object} compiledContractJson compiled JSON from truffle
   * @param {string} contractName contract name (required if you are initializing more then one contract)
   * @return {Promise}
   */
  initContractJson(compiledContractJson, contractInfo) {
    if (typeof compiledContractJson['abi'] == undefined) {
      const error =
        'BcExplorer error: missing ABI in the compiled Truffle JSON.'
      console.error(error)
      throw new Error(error)
    }

    const { contractAddr, contractName } = contractInfo

    var abiArray = compiledContractJson['abi']

    if (!this.web3().utils.isAddress(contractAddr)) {
      const error = `wrong contract address - contractAddr: ${contractAddr}`
      console.error(error)
      throw new Error(error)
    }

    const contract = new this.web3inst.eth.Contract(abiArray, contractAddr)
    contract.currencySymbol = this.info.currencySymbol
    this.contractInst[contractName] = contract
    this.contractAddr[contractName] = contractAddr
    console.log(`contract with name ${contractName} initialized`)
  }

  initWithRetry(addressUrl) {
    return new Promise((resolve, reject) => {
      this.init(addressUrl)
        .then((x) => resolve(x))
        .catch((_error) => {
          console.error(_error)
          console.log('BcExploer init failed! retrying in 3s ...')
          setTimeout(() => {
            this.init(addressUrl)
              .then((x) => resolve(x))
              .catch((error) => reject(error))
          }, 3000)
        })
    })
  }

  /**
   * Initialize Web3 and a smart contract.
   * The compiledContractJson parameter is the JSON of the smart contract settings
   * that you can find in the folder /build/contracts/YourContract.json after
   * the migration.
   *
   * @param {Object} compiledContractJson
   * @param {string} addressUrl
   * @param {string} contractName contract name (required if you are initializing more then one contract)
   * @return {Promise}
   */
  initWithContractJson(addressUrl, compiledContractJson, contractInfoCallback) {
    return new Promise((resolve, reject) => {
      this.initWithRetry(addressUrl)
        .then(() => {
          const contractInfo = contractInfoCallback(compiledContractJson)
          resolve(this.initContractJson(compiledContractJson, contractInfo))
        })
        .catch((error) => reject(error))
    })
  }

  /**
   * Return the info set in the local class variable info.
   *
   * @param {string} attr
   * @return mixed
   */
  getInfo(attr) {
    if (attr) return this.info[attr]
    return this.info
  }

  /**
   * Return the web3 instance.
   * If there is mist/metamask running on the client browser then it will
   * return the global web3 instance. Otherwise it return the local web3 instance.
   *
   * @return {object}
   */
  web3() {
    if (this.web3inst) {
      return this.web3inst
    }

    console.error('BcExplorer error: Web3 is not initialized.')
  }

  /**
   * Check if the connection with the blockchain is established and if the contract
   * is properly initialized.
   *
   * @return {bool}
   */
  isConnected() {
    return this.info.isConnected && this.countContracts()
  }

  /**
   * Return the contract instance.
   *
   * @return {object}
   */
  contract(contractName) {
    if (this.countContracts() == 0) {
      console.error('BcExplorer error: contract is not initialized.')

      return
    }

    contractName = this.contractDefaultName(contractName)

    if (typeof this.contractInst[contractName] == 'undefined') {
      console.error('BcExplorer error: contract does not exist.')

      return
    }

    return this.contractInst[contractName]
  }

  loadChainInfo(chains, networkId) {
    const chainInfo = chains.find((chain) => chain.networkId == networkId)
    console.log(`chainInfo: ${JSON.stringify(chainInfo)}`)
    if (chainInfo) {
      this.info.chainInfo = chainInfo
      this.info.currencySymbol = chainInfo.nativeCurrency.symbol
      return true
    }
    return false
  }

  /**
   * Return the newtwork ID of the connected blockchain.
   *
   * @return {Promise}
   */
  getNetworkId() {
    return new Promise((resolve, reject) => {
      if (this.info.networkId) resolve(this.info.networkId)
      else {
        this.web3().eth.net.getId((error, networkId) => {
          if (error) {
            console.error(error)
            reject(new Error('BcExplorer error: networkId not available.'))
          } else {
            this.info.networkId = networkId
            if (this.loadChainInfo(Chains, networkId)) {
              resolve(networkId)
            } else {
              fetch('https://chainid.network/chains.json')
                .then((r) => r.json())
                .then((chains) => {
                  this.loadChainInfo(chains, networkId)
                  resolve(networkId)
                })
                .catch((err) => {
                  console.log(`fetch error: ${err}`)
                  reject(
                    new Error('BcExplorer error: networkId not available.'),
                  )
                })
            }
          }
        })
      }
    })
  }

  /**
   * Return the selected wallet address.
   *
   * @return {Promise}
   */
  getMainAccount() {
    return new Promise((resolve, reject) => {
      if (this.info.mainAccount) resolve(this.info.mainAccount)
      else
        this.web3().eth.getAccounts((error, accounts) => {
          if (error) {
            reject(new Error('BcExplorer error: accounts not available.'))
          } else {
            this.info.mainAccount = accounts[0]
            console.log(`found accounts: ${accounts.length}`)
            for (const account of accounts) {
              console.log(account)
            }
            resolve(accounts[0])
          }
        })
    })
  }

  /**
   * Return the address of the current user.
   *
   * @return {Promise}
   */
  getCoinbase() {
    return new Promise((resolve, reject) => {
      if (this.info.coinbase) resolve(this.info.coinbase)
      else
        this.web3().eth.getCoinbase((error, coinbase) => {
          if (error) {
            reject(new Error('BcExplorer error: coinbase not available.'))
          } else {
            console.log(`coinbase: ${coinbase}`)
            this.info.coinbase = coinbase

            resolve(coinbase)
          }
        })
    })
  }

  /**
   * Return the balance in Wei of the user.
   *
   * @param {string} accountAddr
   * @return {Promise}
   */
  getBalance(accountAddr) {
    return new Promise((resolve, reject) => {
      this.web3()
        .eth.getBalance(accountAddr)
        .then((bal) => {
          console.log('getBalance:', bal)
          this.info.balance = bal
          resolve(bal)
        })
        .catch((err) => {
          console.log('getBalance error:', err)
          reject(
            new Error(
              'BcExplorer error: impossible to get the balance for the account: ' +
                accountAddr,
            ),
          )
        })
    })
  }

  /**
   * Load the generic info (coinbase, networkId and balance of the user).
   *
   * @return {Promise}
   */
  async loadInfo() {
    try {
      var mainAccount = await this.getMainAccount()
      await this.getCoinbase()
      await this.getBalance(mainAccount)
      await this.getNetworkId()

      return Promise.resolve(this.info)
    } catch (e) {
      return Promise.reject(e)
    }

    // Nested promises: the following piece of code does the same the
    // previous block.
    //
    // return new Promise((resolve, reject) => {
    //     this.getCoinbase().then(coinbase => {
    //         this.getMainAccount().then(account => {
    //             this.getBalance(account).then(balance => {
    //                 this.getNetworkId().then(networkId => {
    //                     resolve(this.info);
    //                 }).catch(error => reject(error));
    //             }).catch(error => reject(error));
    //         }).catch(error => reject(error));
    //     }).catch(error => reject(error));
    // });
  }

  /* ********************************************* */
  /* ************* UTILITY FUNCTIONS ************* */
  /* ********************************************* */

  /**
   * Tranform the balance from Wei to Ether
   *
   * @param {mixed} bal
   * @return {numeric}
   */
  weiToEther(bal) {
    if (typeof bal == 'object') {
      bal = bal.toNumber()
    }

    return this.web3().utils.fromWei(bal, 'ether')
  }

  weiToEtherStr(bal) {
    return `${this.weiToEther(bal)} ${this.info.currencySymbol}`
  }

  etherToWei(bal) {
    if (typeof bal == 'object') {
      bal = bal.toNumber()
    }

    return this.web3().utils.toWei(bal, 'ether')
  }

  /**
   * Transform the parameter from bytes to string.
   *
   * @param {string} bytes
   * @return {string}
   */
  toAscii(bytes) {
    return this.web3()
      .toAscii(bytes)
      .replace(/\u0000/g, '')
  }

  /**
   * Transform a timestamp number to date.
   *
   * @param {numeric} bytes
   * @return {string}
   */
  toDate(timestamp) {
    return new Date(timestamp * 1000).toISOString()
  }

  /**
   * Count the initialized contracts. Note that array of the initialized
   * contracts is an array key => value.
   *
   * @return {Number}
   */
  countContracts() {
    var total = 0

    for (var key in this.contractInst) {
      if (this.contractInst.hasOwnProperty(key)) total++
    }

    return total
  }

  getContractAddress(contractName) {
    return this.contractAddr[contractName]
  }

  /**
   * Return the string "Bookstore" if the contract name is empty.
   *
   * @return {string} name
   * @return {string}
   */
  contractDefaultName(name) {
    return name || 'Bookstore'
  }

  getTransactionUrl(txHash) {
    const urlBase = this.info.chainInfo.explorers
      ? this.info.chainInfo.explorers[0].url
      : 'https://etherscan.io'
    return `${urlBase}/tx/${txHash}`
  }
}

export default BcExplorer
