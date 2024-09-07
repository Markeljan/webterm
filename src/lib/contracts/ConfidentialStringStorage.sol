// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity >=0.8.13 <0.9.0;

import {euint32, inEuint32, ebool, FHE} from "./Fhenix.sol";
import {Permissioned, Permission} from "./Permissioned.sol";
import "./ConfString.sol";

contract ConfidentialStringStorage is Permissioned {
    uint256 public postCount;

    mapping(uint256 => ConfString.EString) private posts;
    mapping(uint256 => address) private postAuthors;

    event PostAdded(uint256 indexed postId, address indexed author);
    event PostUpdated(uint256 indexed postId, address indexed author);

    function addPost(inEuint32[] calldata _encryptedChars) public {
        euint32[] memory encryptedChars = new euint32[](_encryptedChars.length);
        for (uint256 i = 0; i < encryptedChars.length; i++) {
            encryptedChars[i] = FHE.asEuint32(_encryptedChars[i]);
        }
        ConfString.EString memory encryptedMessage = ConfString.EString(
            (encryptedChars)
        );

        uint256 newPostId = postCount;
        posts[newPostId] = encryptedMessage;
        postAuthors[newPostId] = msg.sender;
        postCount++;

        emit PostAdded(newPostId, msg.sender);
    }

    function updatePost(
        uint256 postId,
        inEuint32[] calldata _encryptedChars
    ) external {
        require(
            postAuthors[postId] == msg.sender,
            "Only the author can update the post"
        );
        euint32[] memory encryptedChars = new euint32[](_encryptedChars.length);
        for (uint256 i = 0; i < encryptedChars.length; i++) {
            encryptedChars[i] = FHE.asEuint32(_encryptedChars[i]);
        }
        ConfString.EString memory newEncryptedMessage = ConfString.EString(
            encryptedChars
        );

        posts[postId] = newEncryptedMessage;

        emit PostUpdated(postId, msg.sender);
    }

    function getPostSimple(
        uint256 postId
    ) external view returns (euint32[] memory) {
        require(postId < postCount, "Post does not exist");
        ConfString.EString memory encryptedMessage = posts[postId];
        return encryptedMessage.chars;
    }

    function getPost(uint256 postId) external view returns (uint32[] memory) {
        require(postId < postCount, "Post does not exist");
        ConfString.EString memory encryptedMessage = posts[postId];
        uint32[] memory bytesMessage = new uint32[](
            encryptedMessage.chars.length
        );
        for (uint256 i = 0; i < bytesMessage.length; i++) {
            bytesMessage[i] = FHE.decrypt(encryptedMessage.chars[i]);
        }
        return bytesMessage;
    }

    function getSealedPost(
        uint256 postId,
        Permission calldata permission
    ) public view onlySender(permission) returns (string[] memory) {
        require(postId < postCount, "Post does not exist");
        ConfString.EString memory encryptedMessage = posts[postId];
        string[] memory sealedValues = new string[](
            encryptedMessage.chars.length
        );
        for (uint256 i = 0; i < sealedValues.length; i++) {
            sealedValues[i] = FHE.sealoutput(
                encryptedMessage.chars[i],
                permission.publicKey
            );
        }

        return sealedValues;
    }

    function isPostAuthor(
        uint256 postId,
        address suspectedAuthor
    ) external view returns (ebool) {
        require(postId < postCount, "Post does not exist");
        return
            ConfString.equals(posts[postId], addressToString(suspectedAuthor));
    }

    function getPostLength(uint256 postId) external view returns (euint32) {
        require(postId < postCount, "Post does not exist");
        return ConfString.length(posts[postId]);
    }

    // Helper function to convert address to string
    function addressToString(
        address _addr
    ) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
