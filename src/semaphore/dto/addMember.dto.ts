import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  Min,
  IsString
} from "class-validator";


export class AddMemberDto {
    /**
     * Group id
     */
     @ApiProperty({
        description: "Group id",
        minimum: 0,
        example: 5,
        type: Number,
    })
    @IsInt()
    @Min(0)
    groupId!: number;

    @ApiProperty({
        description: "Identity Commitment",
        example: "11237622825477336339577122413451117718539783476837539122310492284566644730311n",
        type: String,
    })
    @IsString()
    identityCommitment: string
 

}