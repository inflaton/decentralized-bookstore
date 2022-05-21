import { openDialog } from "vue3-promise-dialog";
import AlertDialog from "../components/alertDialog.vue";

export default {
  data() {
    return {
      perf: {},
    };
  },

  methods: {
    userInteractionCompleted(e) {
      this.$emit("userInteractionCompleted", e);
      if (e.error && e.error.code != 4001) {
        const text = `error occurred: ${e.error.message}. \nCheck the browser console for more details.`;
        openDialog(AlertDialog, { text });
      }
    },
    sendTransactionCallback(
      contractName,
      method,
      error,
      txHash,
      updateTransactionStatus
    ) {
      this.perf.t1 = performance.now();
      console.log(
        method +
          " error: " +
          (!error ? error : error.message) +
          " txHash: " +
          txHash
      );
      console.log(
        "Call to " +
          method +
          " took " +
          (this.perf.t1 - this.perf.t0) / 1000 +
          " seconds."
      );
      let txnInfo;
      if (!error) {
        this.userInteractionCompleted({
          result: "submitted",
          method,
        });

        txnInfo = {
          contract: {
            name: contractName,
            method,
          },
          txHash,
          status: "Submitted",
        };

        // it emits a global event in order to update the top menu bar
        this.$Event.emit("transaction_event", txnInfo);
      }

      if (updateTransactionStatus) {
        updateTransactionStatus(error, txnInfo);
      }
    },
    handleTransactionReceipt(
      contractName,
      method,
      bookId,
      txReceipt,
      updateTransactionStatus
    ) {
      this.perf.t2 = performance.now();
      console.log(`${method} txReceipt: ${JSON.stringify(txReceipt)}`);

      console.log(
        `${method} confirmation took ${
          (this.perf.t2 - this.perf.t1) / 1000
        } seconds.`
      );
      let transactionId = undefined;
      let tokenId = undefined;
      if (contractName == "Bookstore") {
        bookId = bookId || txReceipt.events.NewBook.returnValues.bookId;
        if (txReceipt.events.NewPurchase) {
          transactionId =
            txReceipt.events.NewPurchase.returnValues.transactionId;
          tokenId = txReceipt.events.NewPurchase.returnValues.tokenId;
        }
      }
      const tokenAddress = tokenId
        ? window.bc.getContractAddress(contractName)
        : undefined;
      const txnInfo = {
        contract: {
          name: contractName,
          method,
        },
        txHash: txReceipt.transactionHash,
        perf: this.perf,
        status: "Confirmed",
        bookId,
        transactionId,
        tokenAddress,
        tokenId,
      };
      // it emits a global event in order to update the top menu bar
      this.$Event.emit("transaction_event", txnInfo);

      if (updateTransactionStatus) {
        updateTransactionStatus(null, txnInfo);
      }
    },
    invokeSmartContract(
      contractName,
      method,
      getContractInfo,
      updateTransactionStatus
    ) {
      const contractInfo = getContractInfo(contractName, method);
      const option = {
        from: contractInfo.address,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      };
      if (contractInfo.value) {
        option.value = contractInfo.value;
      }

      console.log(`invokeSmartContract - option: ${JSON.stringify(option)}`);

      this.perf.t0 = performance.now();
      // call method/buyBook function of contract
      contractInfo.method
        .send(option, (error, txHash) =>
          this.sendTransactionCallback(
            contractName,
            method,
            error,
            txHash,
            updateTransactionStatus
          )
        )
        .then((txReceipt) =>
          this.handleTransactionReceipt(
            contractName,
            method,
            contractInfo.bookId,
            txReceipt,
            updateTransactionStatus
          )
        )
        .catch((error) => {
          this.userInteractionCompleted({ result: "error", error });
          if (updateTransactionStatus) {
            updateTransactionStatus(error, null);
          }
        });
    },
  },
};
