//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

abstract contract BSContext is ERC721URIStorage, Ownable {
    address public contractOwner;

    constructor() {
        contractOwner = _msgSender();
    }

    function _msgValue() internal view virtual returns (uint256 value) {
        return msg.value;
    }

    /**
     * @dev Check if the current caller is the contract owner.
     */
    function isOwner() internal view returns (bool) {
        return contractOwner == _msgSender();
    }
}

contract Bookstore is BSContext {
    struct Book {
        uint256 id;
        string name;
        string description;
        bool valid; // false if been borrowed
        uint256 price; // TRX per day
        address owner; // owner of the book
    }

    uint256 public bookId;

    mapping(uint256 => Book) public books;

    struct Transaction {
        uint256 bookId;
        uint256 timestamp;
        address buyer; // buyer's address
        uint256 tokenId;
    }

    uint256 public transactionId;

    mapping(uint256 => Transaction) public transactions;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721('My Books', 'BOOK_NFT') {}

    function totalBooks(bool validOnly) public view returns (Book[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < bookId; i++) {
            Book memory book = books[i];
            if (!validOnly || book.valid) {
                count++;
            }
        }

        Book[] memory result = new Book[](count);
        count = 0;
        for (uint256 i = 0; i < bookId; i++) {
            Book memory book = books[i];
            if (!validOnly || book.valid) {
                result[count++] = book;
            }
        }
        return result;
    }

    /**
     * @dev Add a Book with predefined `name`, `description` and `price`
     * to the bookstore.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {NewBook} event.
     */
    function sellBook(
        string memory name,
        string memory description,
        uint256 price
    ) public returns (bool success) {
        Book memory book = Book(
            bookId,
            name,
            description,
            true,
            price,
            _msgSender()
        );

        books[bookId] = book;

        emit NewBook(bookId++);

        return true;
    }

    function _mintNFT(address recipient, string memory tokenURI)
        internal
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    /**
     * @dev Borrow a book has `_bookId`. The rental period starts from
     * `startTime` ends with `endTime`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a `NewPurchase` event.
     */
    function buyBook(
        uint256 _bookId,
        uint256 timestamp,
        string memory tokenURI
    ) public payable returns (bool) {
        Book storage book = books[_bookId];

        require(book.valid == true, 'The book is invalid');

        _sendPurchaseFee(book.owner, _msgValue());

        uint256 tokenId = _mintNFT(_msgSender(), tokenURI);

        transactions[transactionId] = Transaction(
            _bookId,
            timestamp,
            _msgSender(),
            tokenId
        );

        emit NewPurchase(_bookId, transactionId++, tokenId);

        return true;
    }

    /**
     * @dev Delete a book from the bookstore. Only the book's owner or the
     * bookstore's owner is authorised for this operation.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a `DeleteBook` event.
     */
    function deleteBook(uint256 _bookId) public returns (bool success) {
        require(
            _msgSender() == books[_bookId].owner || isOwner(),
            'You are not authorised to delete this book.'
        );

        Book storage book = books[_bookId];
        book.valid = false;

        emit DeleteBook(_bookId);

        return true;
    }

    /**
     * @dev Calculate the number of days a book is rented out.
     */
    function _days(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (uint256)
    {
        if ((endTime - startTime) % uint256(86400) == 0) {
            return (endTime - startTime) / uint256(86400);
        } else {
            return (endTime - startTime) / uint256(86400) + uint256(1);
        }
    }

    /**
     * @dev Send TRX to the book's owner.
     */
    function _sendPurchaseFee(address receiver, uint256 value) internal {
        payable(address(uint160(receiver))).transfer(value);
    }

    /**
     * @dev Emitted when a new book is added to the bookstore.
     * Note `bookId` starts from 0.
     */
    event NewBook(uint256 indexed bookId);

    /**
     * @dev Emitted when a new book rental is made.
     * Note `transactionId` and `bookId` start from 0.
     */
    event NewPurchase(
        uint256 indexed bookId,
        uint256 indexed transactionId,
        uint256 indexed tokenId
    );

    /**
     * @dev Emitted when a book is deleted from the bookstore.
     */
    event DeleteBook(uint256 indexed bookId);
}
