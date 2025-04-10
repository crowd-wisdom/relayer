import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import hardhat from "hardhat";
import { AddMemberDto } from './addMember.dto.js';
import Semaphore from '../utils/abis/Semaphore.json' with { type: 'json' };
import { TransactionRequest,ethers, getBigInt } from "ethers";
import { TxBackoffClient } from '../utils/txBackOff.js';
import { IAddMembersOptions } from './types.js';

@Injectable()
export class SemaphoreService {
    constructor(private configService: ConfigService) {}
    async createIdentity() :  Promise<bigint> {
        const keyIdentity = this.configService.get<string>('KEY_IDENTITY');     
        const { privateKey, publicKey, commitment } = new Identity(keyIdentity)
        return commitment
    }
    async createGroup() :  Promise<any> {
        const group = new Group()
        const keyIdentity = this.configService.get<string>('KEY_IDENTITY');     
        const identity = new Identity(keyIdentity)
        const { privateKey, publicKey, commitment } = identity
        group.addMember(commitment)
        const scope = group.root
        const message = 1
        const proof = await generateProof(identity, group, message, scope)
        return proof
    }
    async addMember(args : AddMemberDto,options?: IAddMembersOptions): Promise<any> {

        const semaphoreAddress = await hardhat.ethers.getContractAt(Semaphore.abi,this.configService.get<string>('SEMAPHORE_ADDRESS'))
        const iface = new ethers.Interface(Semaphore.abi);
        const validNumericString = getBigInt( args.identityCommitment.slice(0, -1)) //Remove the 'n' off the commitment
        const data = iface.encodeFunctionData("addMember", [args.groupId,validNumericString]);
        let transaction : TransactionRequest = {}
        transaction.to = semaphoreAddress.target as ethers.AddressLike
        transaction.data = data
        const txBackOff = new TxBackoffClient()

        const result = await txBackOff.sendTx(transaction)
        options?.onComplete?.(result.hash);
        return result
    }
}
