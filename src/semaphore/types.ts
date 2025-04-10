import { AddMemberDto } from "./addMember.dto.js";

/**
 * WS events for add member
 */
export enum EAddMemberEvents {
    START = "start-add-member",
    PROGRESS = "progress-add-member",
    FINISH = "finish-add-member",
    ERROR = "exception-add-member",
  }

  /**
 * Interface that represents add member options
 */
export interface IAddMembersOptions {

  /**
   * Hook to call when add members is completed
   *
   * @param dataTransaction - proof generated data
   */
  onComplete?: (dataTransaction : string) => void;

  /**
   * Hook to call when generation is failed
   *
   * @param error - error
   */
  onFail?: (error: Error) => void;
}