import { IPacket } from "./IPacket";

export interface IFriendsListProps {
  acceptedFriends: string[];
  newAcceptedFriends: string[];
  incomingRequests: string[];
  newIncomingRequests: string[];
  outgoingRequests: string[];
}

export interface IFriendsList extends IFriendsListProps, IPacket {}
