import { Wallet } from './wallet';

/**
 * Browser window containing a global `solana` object.
 */
export interface GlobalSolanaWindow extends Window {
    /**
     * Global `solana` object.
     */
    solana?: GlobalSolana;
}

/**
 * Global `solana` object.
 */
export interface GlobalSolana {
    /**
     * Global `solana.wallets` object.
     */
    wallets?: GlobalSolanaWallets;
}

/**
 * Versions of the global `solana.wallets` object API.
 */
export enum GlobalSolanaWalletsVersion {
    /**
     * Initial version.
     */
    '1.0.0' = '1.0.0',
}

/**
 * Events emitted by the global `solana.wallets` object.
 */
export interface GlobalSolanaWalletsEvents {
    /**
     * Emitted when one or more wallets are registered.
     *
     * @param wallets One or more wallets that were registered.
     */
    registered(...wallets: Wallet[]): void;
}

/**
 * Global `solana.wallets` object API.
 */
export type GlobalSolanaWallets = Readonly<{
    /**
     * Version of the global `solana.wallets` object API.
     */
    version: GlobalSolanaWalletsVersion;

    /**
     * Get the wallets that have been registered.
     */
    get(): Readonly<Wallet[]>;

    /**
     * Register one or more wallets. This emits a `registered` event.
     */
    register(...wallets: Wallet[]): void;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends keyof GlobalSolanaWalletsEvents>(event: E, listener: GlobalSolanaWalletsEvents[E]): () => void;
}>;
