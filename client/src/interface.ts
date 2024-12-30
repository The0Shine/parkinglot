export interface ISlot {
  empty: boolean;
  number: number;
  _id: string;
}

export interface ILog {
  _id: string;
  bill: number;
  paid: boolean;
  cardId: string;
  userId?: string;
  licensePlate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  phone: string;
  name: string;
  cccd: string;
  cardId?: ICard;
}

export interface ICard {
  _id: string;
  uid: string;
  type: string;
}

export interface IWarning {
  _id: string;
  cardId: string;
  userId: string;
  desc: string;
}
