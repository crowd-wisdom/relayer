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
        type: Number,
    })
    @IsInt()
    @Min(0)
    groupId!: number;

    @ApiProperty({
        description: "Identity Commitment",
        type: String,
    })
    @IsString()
    identityCommitment: string
 

}