// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import {euint32, ebool, FHE} from "./Fhenix.sol";

/// @title Confidential String Library
/// @notice Provides methods for creating and managing strings encrypted with FHE (Fully Homomorphic Encryption)
/// @dev Assumes the existence of an FHE library that implements fully homomorphic encryption functions

library ConfString {
    /// @dev A representation of an encrypted string using Fully Homomorphic Encryption.
    /// It consists of an array of encrypted 32-bit unsigned integers (`euint32`).
    struct EString {
        euint32[] chars;
    }

    /// @notice Encrypts a plaintext string into its encrypted representation (`EString`).
    /// @dev Iterates over the characters of the string, encrypting each as a euint32.
    /// @param str The plain string to encrypt
    /// @return estr The encrypted representation of the string
    function toEString(
        string memory str
    ) internal pure returns (EString memory) {
        bytes memory strBytes = bytes(str);
        EString memory estr;
        estr.chars = new euint32[](strBytes.length);

        for (uint256 i = 0; i < strBytes.length; i++) {
            estr.chars[i] = FHE.asEuint32(uint8(strBytes[i]));
        }

        return estr;
    }

    /// @notice Decrypts an `EString` to retrieve the original plaintext string.
    /// @dev This operation should be used with caution as it exposes the encrypted string.
    /// @param estr The encrypted string to decrypt
    /// @return The decrypted plaintext string
    function unsafeToString(
        EString memory estr
    ) internal pure returns (string memory) {
        bytes memory result = new bytes(estr.chars.length);
        for (uint256 i = 0; i < estr.chars.length; i++) {
            result[i] = bytes1(uint8(FHE.decrypt(estr.chars[i])));
        }
        return string(result);
    }

    function toSealedString(
        EString memory estr,
        bytes32 publicKey
    ) internal pure returns (string[] memory) {
        string[] memory result = new string[](estr.chars.length);
        for (uint256 i = 0; i < estr.chars.length; i++) {
            result[i] = FHE.sealoutput(estr.chars[i], publicKey);
        }
        return (result);
    }

    /// @notice Re-encrypts the encrypted values within an `EString`.
    /// @dev The re-encryption is done to change the encrypted representation without
    /// altering the underlying plaintext string, which can be useful for obfuscation purposes.
    /// @param estr The encrypted string to re-encrypt
    /// @param ezero An encrypted zero value that triggers the re-encryption
    function resetEString(EString memory estr, euint32 ezero) internal pure {
        for (uint256 i = 0; i < estr.chars.length; i++) {
            // Adding zero will practically reencrypt the value without it being changed
            estr.chars[i] = estr.chars[i] + ezero;
        }
    }

    /// @notice Determines if an encrypted string is equal to a given plaintext string.
    /// @dev This operation encrypts the plaintext string and compares the encrypted representations.
    /// @param lhs The encrypted string to compare
    /// @param str The plaintext string to compare against
    /// @return res A boolean indicating if the encrypted and plaintext strings are equal
    function equals(
        EString storage lhs,
        string memory str
    ) internal view returns (ebool) {
        EString memory rhs = toEString(str);
        if (lhs.chars.length != rhs.chars.length) {
            return FHE.asEbool(false);
        }
        ebool res = FHE.asEbool(true);
        for (uint256 i = 0; i < lhs.chars.length; i++) {
            res = res & FHE.eq(lhs.chars[i], rhs.chars[i]);
        }
        return res;
    }

    /// @notice Concatenates two encrypted strings.
    /// @dev Creates a new EString with the combined characters of both input strings.
    /// @param lhs The first encrypted string
    /// @param rhs The second encrypted string
    /// @return result The concatenated encrypted string
    function concat(
        EString memory lhs,
        EString memory rhs
    ) internal pure returns (EString memory) {
        EString memory result;
        result.chars = new euint32[](lhs.chars.length + rhs.chars.length);

        for (uint256 i = 0; i < lhs.chars.length; i++) {
            result.chars[i] = lhs.chars[i];
        }
        for (uint256 i = 0; i < rhs.chars.length; i++) {
            result.chars[lhs.chars.length + i] = rhs.chars[i];
        }

        return result;
    }

    /// @notice Gets the length of an encrypted string.
    /// @param estr The encrypted string
    /// @return length The length of the string as a euint32
    function length(EString memory estr) internal pure returns (euint32) {
        return FHE.asEuint32(estr.chars.length);
    }

    /// @notice Conditionally updates an encrypted string.
    /// @dev If the condition is true, updates the string with the new value.
    /// @param condition The condition to check
    /// @param estr The original encrypted string
    /// @param newEstr The new encrypted string to potentially replace the original
    /// @return The updated (or original) encrypted string
    function conditionalUpdate(
        ebool condition,
        EString memory estr,
        EString memory newEstr
    ) internal pure returns (EString memory) {
        require(
            estr.chars.length == newEstr.chars.length,
            "String lengths must match"
        );

        for (uint256 i = 0; i < estr.chars.length; i++) {
            estr.chars[i] = FHE.select(
                condition,
                newEstr.chars[i],
                estr.chars[i]
            );
        }

        return estr;
    }
}
