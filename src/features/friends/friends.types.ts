import { IEmpty } from "@/packets/interfaces/IEmpty";
import { IPacket } from "@/packets/interfaces/IPacket";

export interface IAcceptFriendRequest extends IPacket {
    nickname: string | null;
}
export interface IAcknowledgeNewFriend extends IPacket {
    nickname: string | null;
}
export interface IAcknowledgeNewFriendRequest extends IPacket {
    nickname: string | null;
}
export interface IAlreadyFriends extends IPacket {
    nickname: string | null;
}
export interface ICancelFriendRequest extends IPacket {
    nickname: string | null;
}
export interface ICheckUserExistsForFriend extends IPacket {
    nickname: string | null;
}
export interface IDeclineAllFriendRequests extends IEmpty { }
export interface IDeclineFriendRequest extends IPacket {
    nickname: string | null;
}
export interface IFriendRemoved extends IPacket {
    nickname: string | null;
}
export interface IFriendRequestAccepted extends IPacket {
    nickname: string | null;
}
export interface IFriendRequestAlreadySent extends IPacket {
    nickname: string | null;
}
export interface IFriendRequestCanceledOrDeclined extends IPacket {
    nickname: string | null;
}
export interface IFriendRequestDeclined extends IPacket {
    nickname: string | null;
}
export interface IFriendRequestSent extends IPacket {
    nickname: string | null;
}
export interface IFriendsListProps {
    acceptedFriends: string[];
    newAcceptedFriends: string[];
    incomingRequests: string[];
    newIncomingRequests: string[];
    outgoingRequests: string[];
}
export interface IFriendsList extends IFriendsListProps, IPacket { }
export interface IIncomingFriendRequestExists extends IPacket {
    nickname: string | null;
}
export interface ILoadFriends extends IPacket {
    unknown: boolean;
}
export interface INewFriendRequest extends IPacket {
    nickname: string | null;
}
export interface IRemoveFriend extends IPacket {
    nickname: string | null;
}
export interface ISendFriendRequest extends IPacket {
    nickname: string | null;
}
export interface IRequestFriendsListWindow extends IEmpty { }
export interface IShowFriendsListWindow extends IEmpty { }