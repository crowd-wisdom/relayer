import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"


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
}
