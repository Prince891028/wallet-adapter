/**
 * Solana cluster to simulate and send transactions using.
 */
export enum WalletNetwork {
    /**
     * Mainnet, e.g. https://api.mainnet-beta.solana.com
     */
    Mainnet = 'mainnet',

    /**
     * Devnet, e.g. https://api.devnet.solana.com
     */
    Devnet = 'devnet',

    /**
     * Testnet, e.g. https://api.testnet.solana.com
     */
    Testnet = 'testnet',
}

/**
 * Versions of the Wallet API.
 */
export enum WalletVersion {
    /**
     * Initial version.
     */
    '1.0.0' = '1.0.0',
}

/**
 * Ciphers supported by wallets for encryption and decryption.
 */
export enum WalletCipher {
    /**
     * Default for NaCl.
     */
    'x25519-xsalsa20-poly1305' = 'x25519-xsalsa20-poly1305',
}

/**
 * A readonly Uint8Array.
 */
export type Bytes = Readonly<Uint8Array>;

/**
 * Events emitted by wallets.
 */
export interface WalletEvents {
    /**
     * Emitted when the enumerable accounts of the wallet are changed.
     */
    accountsChanged(): void;
}

/**
 * TODO: docs
 */
export type Wallet = Readonly<{
    /**
     * Version of the Wallet API.
     */
    version: WalletVersion;

    /**
     * Name of the wallet. This will be displayed by Wallet Adapter and apps. It should be unique to the wallet extension.
     */
    name: string;

    /**
     * Icon of the wallet. This will be displayed by Wallet Adapter and apps. It should be a data URL containing a base64-encoded SVG or PNG image.
     */
    icon: string;

    /**
     * TODO: docs
     * TODO: figure out of this needs more params for autoconnect and multiple account detection
     *
     *
     * @param publicKey One or more optional public keys of the accounts in the wallet. Default to whatever the wallet wants.
     *
     * @return TODO: docs
     */
    connect(publicKey?: Bytes[]): Promise<ConnectedWallet[]>;

    /**
     * Enumerate the public keys of accounts in the wallet.
     * TODO: determine whether there needs to be a getAccounts (non-interactive) vs. requestsAccounts (interactive) distinction
     *
     * @return One or more public keys.
     */
    getAccounts(): Promise<Bytes[]>;

    /**
     * Enumerate the ciphers supported for encryption and decryption.
     *
     * @return TODO: docs
     */
    getCiphers(): Promise<WalletCipher[]>;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends keyof WalletEvents>(event: E, listener: WalletEvents[E]): () => void;
}>;

/**
 * TODO: docs
 */
export type ConnectedWallet = Readonly<{
    /**
     * Public key of the account in the wallet.
     */
    publicKey: Bytes;

    /**
     * Sign one or more serialized transactions. The transaction(s) may already be partially signed.
     * This method covers existing `signTransaction` and `signAllTransactions` functionality, matching the SMS Mobile Wallet Adapter SDK.
     *
     * @param transaction One or more serialized transactions.
     * @param options     Options to configure signing transactions.
     *
     * @return One or more signed, serialized transactions. This allows multisig wallets, program wallets, and other wallets that use meta-transactions to return a modified, signed transaction.
     */
    signTransaction(transaction: Bytes[], options?: SignTransactionOptions): Promise<Bytes[]>;

    /**
     * Sign and send one or more serialized transactions. The transaction(s) may already be partially signed.
     * This method covers existing `signAndSendTransaction` functionality, and also provides an `All` version of the same, matching the SMS Mobile Wallet Adapter SDK.
     *
     * @param transaction One or more serialized transactions.
     * @param options     Options to configure signing and sending transactions.
     *
     * @return One or more "primary" transaction signatures, as raw bytes. We return raw bytes to avoid ambiguity about the signature encoding.
     */
    signAndSendTransaction(transaction: Bytes[], options?: SignAndSendTransactionOptions): Promise<Bytes[]>;

    /**
     * Sign some raw bytes. For security, the bytes will be prefixed with TODO: some TBD prefix bytes.
     * We don't call this `signMessage` to avoid confusion with signing transaction [Message](https://solana-labs.github.io/solana-web3.js/classes/Message.html) bytes, which is what we secure against by prefixing the bytes.
     *
     * @param data One or more sets of raw bytes to sign.
     *
     * @return One or more signatures, as raw bytes. We return raw bytes to avoid ambiguity about the signature encoding.
     */
    sign(data: Bytes[]): Promise<Bytes[]>;

    /**
     * Encrypt one or more cleartexts.
     *
     * @param publicKey Public key to derive a shared secret to encrypt the data using.
     * @param data      One or more cleartexts to encrypt.
     * @param options   Options to configure encryption.
     *
     * @return Result of encryption.
     */
    encrypt(publicKey: Bytes, data: Bytes[], options?: EncryptOptions): Promise<EncryptResult>;

    /**
     * Decrypt one or more ciphertexts.
     *
     * @param publicKey Public key to derive a shared secret to decrypt the data using.
     * @param data      One or more ciphertexts to decrypt.
     * @param nonce     One or more nonces to use.
     * @param options   Options to configure decryption.
     *
     * @return Result of decryption.
     */
    decrypt(publicKey: Bytes, data: Bytes[], nonce: Bytes[], options?: DecryptOptions): Promise<DecryptResult>;
}>;

/**
 * Options to configure signing transactions.
 */
export type SignTransactionOptions = Readonly<{
    /**
     * Optional Solana cluster name to simulate the transaction using. Default to mainnet.
     */
    network?: WalletNetwork;
}>;

/**
 * Options to configure signing and sending transactions.
 */
export type SignAndSendTransactionOptions = Readonly<{
    /**
     * Optional Solana cluster name to simulate and send the transaction using. Default to mainnet.
     */
    network?: WalletNetwork;
}>;

/**
 * Options to configure encryption.
 */
export type EncryptOptions = Readonly<{
    /**
     * Optional cipher to use. Default to whatever the wallet wants.
     */
    cipher?: WalletCipher;
}>;

/**
 * Result of encryption.
 */
export type EncryptResult = Readonly<{
    /**
     * One or more ciphertexts that were encrypted, corresponding with the cleartexts provided.
     */
    data: Bytes[];
    /**
     * One or more nonces that were used for encryption, corresponding with each ciphertext.
     */
    nonce: Bytes[];
    /**
     * Cipher that was used for encryption.
     */
    cipher: WalletCipher;
}>;

/**
 * Options to configure decryption.
 */
export type DecryptOptions = Readonly<{
    /**
     * Optional cipher to use. Default to whatever the wallet wants.
     */
    cipher?: WalletCipher;
}>;

/**
 * Result of decryption.
 */
export type DecryptResult = Readonly<{
    /**
     * One or more cleartexts that were decrypted, corresponding with the ciphertexts provided.
     */
    data: Bytes[];
    /**
     * Cipher that was used for decryption.
     */
    cipher: WalletCipher;
}>;
