import BcExplorer from "./BcExplorer";
import BookstoreContract from "../assets/Bookstore.json";

export default {
  data() {
    return {
      bcConnected: false, // true when the connection with the blockchain is established, plus the contract ABI + address is correctly initialized
      bcConnectionError: false,
      errorConnectionMessage: null,
      bcSmartContractAddressError: false,
      currencySymbol: "ETH",
      networkName: "localhost",
      bcInfo: null,
    };
  },

  created() {
    this.init();
  },

  methods: {
    /**
     * Initialize the BcExplore object (this means the connection with the
     * blockchain and initialize the contracts).
     *
     * @return {void}
     */
    init() {
      // when this file is imported to other component it checks if the BcExplorer
      // is instantiated.
      if (!window.bc) {
        window.bc = new BcExplorer();

        // connecting to the blockchain and intializing the Bookstore smart contract
        window.bc
          .initWithContractJson(
            import.meta.env.VITE_PROVIDER_ADDRESS_URL,
            BookstoreContract,
            this.getContractInfo
          )
          .then((error1) => {
            // handling the connection error
            if (error1) {
              this.bcConnected = false;
              this.showConnectionErrorMessage(error1);
            } else {
              this.bcConnectionError = false;
              this.bcConnected = this.blockchainIsConnected();
            }
          })
          .catch((error) => {
            this.showConnectionErrorMessage(error);
            this.bcSmartContractAddressError = true;
          });
      }
    },
    initBcInfo() {
      if (!this.bcInfo && window.bc && window.bc.info.chainInfo) {
        this.bcInfo = window.bc.info;
        this.currencySymbol = this.bcInfo.currencySymbol;
        this.networkName =
          this.bcInfo.chainInfo.title || this.bcInfo.chainInfo.name;
      }
    },
    getContractInfo(compiledContractJson) {
      this.initBcInfo();
      const currencySymbol = this.bcInfo.currencySymbol;
      const contractName = compiledContractJson.contractName;
      const envKey = "VITE_BOOKSTORE_CONTRACT_ADDRESS";
      let contractAddr = import.meta.env[envKey + "_" + currencySymbol];
      if (!contractAddr || contractAddr == "") {
        const network = compiledContractJson.networks[this.bcInfo.networkId];
        contractAddr = network ? network.address : import.meta.env[envKey];
      }
      const result = { contractAddr, contractName };
      console.log(
        `getContractInfo(${currencySymbol}): ${JSON.stringify(result)}`
      );
      return result;
    },

    /**
     * Show the conntection error message on top of the main content.
     *
     * @param {object} error|null
     * @return {void}
     */
    showConnectionErrorMessage(error = null) {
      this.bcConnectionError = true;

      if (error) console.log(error);

      if (error && error.message) {
        this.errorConnectionMessage = error.message;
      }
    },

    /**
     * Check if the connection with the blockchain is established and if the smart
     * contract ABI + address are correctly initialized.
     *
     * @return {boolean}
     */
    blockchainIsConnected() {
      this.bcConnected = window.bc != undefined && window.bc.isConnected();
      if (this.bcConnected) {
        this.initBcInfo();
      }
      return this.bcConnected;
    },

    /**
     * Transform the parameter from bytes to string.
     *
     * @param {string} bytesStr
     * @return {string}
     */
    toAscii(bytesStr) {
      return window.bc.toAscii(bytesStr);
    },

    /**
     * Transform a timestamp number to date.
     *
     * @param {numeric} bytesStr
     * @return {string}
     */
    toDate(timestamp) {
      return new Date(timestamp * 1000).toISOString();
    },
  },
};
