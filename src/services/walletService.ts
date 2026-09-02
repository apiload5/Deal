import { UserWallet, WalletTransaction, DealRoom, PaymentGateway, WalletTxType } from '../types';
import { INITIAL_WALLETS, INITIAL_DEAL_ROOMS } from '../data/mockData';

export class WalletService {
  private static instance: WalletService;
  private wallets: Record<string, UserWallet> = { ...INITIAL_WALLETS };
  private dealRooms: DealRoom[] = [...INITIAL_DEAL_ROOMS];
  private listeners: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getWallet(userId: string): UserWallet {
    if (!this.wallets[userId]) {
      this.wallets[userId] = {
        userId,
        availableBalance: 50000,
        lockedStake: 0,
        totalEarned: 0,
        totalSpent: 0,
        transactions: []
      };
    }
    return this.wallets[userId];
  }

  public depositFunds(userId: string, amount: number, method: PaymentGateway, referenceId: string): WalletTransaction {
    const wallet = this.getWallet(userId);
    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userId,
      amount,
      type: 'topup' as WalletTxType,
      status: 'completed',
      description: `Deposit via ${method} (Ref: ${referenceId})`,
      paymentMethod: method,
      referenceId,
      createdAt: new Date().toISOString()
    };

    wallet.availableBalance += amount;
    wallet.transactions = [tx, ...wallet.transactions];
    this.notify();
    return tx;
  }

  public getDealRooms(): DealRoom[] {
    return this.dealRooms;
  }

  public createDealRoom(data: Omit<DealRoom, 'id' | 'createdAt' | 'status'>): DealRoom {
    const newDeal: DealRoom = {
      ...data,
      id: `deal-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.dealRooms = [newDeal, ...this.dealRooms];
    this.notify();
    return newDeal;
  }
}

export const walletService = WalletService.getInstance();
