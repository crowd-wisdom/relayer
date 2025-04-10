import { ethers, Provider, TransactionReceipt, TransactionRequest, Wallet } from "ethers";
import dotenv from "dotenv";
import { Logger } from "@nestjs/common";
import { getGasCost } from "./gasCost.js";


dotenv.config();

export class TxBackoffClient {
  private readonly logger = new Logger(TxBackoffClient.name);

  provider: Provider;
    wallet: Wallet;
    maxRetries: number;
    gasBumpFactor: number;
    retryDelayMs: number;
  constructor({
    providerUrl = process.env.RELAYER_RPC_URL,
    privateKey = process.env.SIGNER_PK,
    maxRetries = 3,
    gasBumpFactor = 1.2,
    retryDelayMs = 15000
  } = {}) {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.maxRetries = maxRetries;
    this.gasBumpFactor = gasBumpFactor;
    this.retryDelayMs = retryDelayMs;
  }

  async simulateTx(tx:TransactionRequest) {
    try {
      await this.provider.call(tx);
      return null; // no error
    } catch (err) {
      console.info(err)
      return err.reason || err.data?.message || err.message || "Unknown error";
    }
  }

  async sendTx(txRequest:TransactionRequest) : Promise<TransactionReceipt> {
    let nonce = await this.provider.getTransactionCount(this.wallet.address, "latest");
    let retries = 0;
    let gasPrice = await getGasCost(this.provider);

    while (retries <= this.maxRetries) {
      const tx = {
        ...txRequest,
        gasPrice,
        nonce
      };

      const simulationError = await this.simulateTx(tx);
      if (simulationError) {
        throw new Error(`⚠️ Simulation failed: ${simulationError}`);
      }

      const txResponse = await this.wallet.sendTransaction(tx);

      this.logger.log(`🔁 Intent ${retries + 1} - Send tx with nonce ${nonce}: ${txResponse.hash}`);

      try {
        const receipt = await txResponse.wait();
        this.logger.log(`✅ Confirm in block ${receipt.blockNumber}: ${receipt.hash}`);
        return receipt;
      } catch {
        retries++;
        if (retries > this.maxRetries) break;
        gasPrice = gasPrice * BigInt(Math.floor(this.gasBumpFactor * 100)) / 100n;
        this.logger.warn("⏳ It was not mined, trying again with more gas...");
        await new Promise(res => setTimeout(res, this.retryDelayMs));
      }
    }

    this.logger.error("❌ Transaction not confirmed after several attempts.");
    throw new Error("Transaction failed after multiple attempts");
  }
}
