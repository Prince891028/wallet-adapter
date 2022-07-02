import {
    GlobalSolanaWindow,
    Wallet,
    GlobalSolanaWallets,
    GlobalSolanaWalletsEvents,
    GlobalSolanaWalletsVersion,
} from '../interfaces';

// This code will be run by every wallet extension, and also by Wallet Adapter.
// The first one to run will create the `window.solana.wallets` API for the rest to reuse.
declare const window: GlobalSolanaWindow;

(function () {
    // Just check loosely for existence. Wallets could have logic for augmenting or replacing old versions if found.
    if (!window.solana?.wallets?.version) {
        // If `window.solana` hasn't been created yet, create it so it can't be overwritten.
        if (!window.solana) {
            Object.defineProperty(window, 'solana', { writable: false, value: {} });
        }
        Object.defineProperty(window.solana, 'wallets', { writable: false, value: createWindowSolanaWallets() });
    }
    // Here a wallet would call `window.solana.wallets.register(...)` to add itself.
})();

function createWindowSolanaWallets(): GlobalSolanaWallets {
    const items: Wallet[] = [];
    const listeners: { [E in keyof GlobalSolanaWalletsEvents]?: GlobalSolanaWalletsEvents[E][] } = {};

    function emit<E extends keyof GlobalSolanaWalletsEvents>(
        event: E,
        ...args: Parameters<GlobalSolanaWalletsEvents[E]>
    ) {
        listeners[event]?.forEach((listener) => listener(...args));
    }

    return {
        version: GlobalSolanaWalletsVersion['1.0.0'],
        get(): Readonly<Wallet[]> {
            return [...items];
        },
        register(...wallets: Wallet[]): void {
            items.push(...wallets);

            emit('registered', ...wallets);
        },
        on<E extends keyof GlobalSolanaWalletsEvents>(event: E, listener: GlobalSolanaWalletsEvents[E]): () => void {
            listeners[event]?.push(listener) || (listeners[event] = [listener]);

            return function (): void {
                listeners[event] = listeners[event]?.filter((l) => listener !== l);
            };
        },
    };
}
