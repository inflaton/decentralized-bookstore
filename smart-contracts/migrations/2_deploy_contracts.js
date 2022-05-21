var BookstoreContract = artifacts.require("./Bookstore.sol");

module.exports = function (deployer) {
  deployer.deploy(BookstoreContract);
};
