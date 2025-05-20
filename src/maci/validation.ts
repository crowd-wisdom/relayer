import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { PublicKey } from "@maci-protocol/domainobjs";

/**
 * Validate public key
 */
@ValidatorConstraint({ name: "publicKey", async: false })
export class PublicKeyValidator implements ValidatorConstraintInterface {
  /**
   * Try to deserialize public key from text and return status of validation
   *
   * @param text text to validate
   * @returns status of validation
   */
  validate(text: string): boolean {
    try {
      const [x, y] = PublicKey.deserialize(text).asArray();
      return Boolean(new PublicKey([x, y]));
    } catch (error) {
      return false;
    }
  }

  /**
   * Return default validation message
   *
   * @returns default validation message
   */
  defaultMessage(): string {
    return "Public key is invalid";
  }
}

/**
 * Check if the string is a valid base58 encoded CIDv1 hash
 */
const IPFS_REGEX = /^Qm[a-zA-Z0-9]{44}$/;

/**
 * Validate public key
 */
@ValidatorConstraint({ name: "ipfsHash", async: false })
export class IpfsHashValidator implements ValidatorConstraintInterface {
  /**
   * Validate ipfs hash
   *
   * @param text text to validate
   * @returns status of validation
   */
  validate(text: string): boolean {
    return IPFS_REGEX.test(text);
  }

  /**
   * Return default validation message
   *
   * @returns default validation message
   */
  defaultMessage(): string {
    return "IPFS hash is invalid";
  }
}
