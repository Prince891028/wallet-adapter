# [WIP] `@solana/wallet-adapter-standard`

This package outlines the Solana Wallet Standard.

The singular purpose of this standard is to improve the user experience of wallets on Solana.

We intend for this standard to become broadly adopted by browser extension wallets.

This is an incomplete work in progress and subject to change.

Wallets and dapps are encouraged to provide their feedback and have it integrated.

## Code

- [Global `window.solana.wallets` interface](./src/interfaces/global.ts)
- [Wallet interface](./src/interfaces/wallet.ts)
- [Reference implementation for how wallets attach to the window](./src/implementation/window.ts)

## Design Principles and Goals

### This standard applies to browser extension wallets only

This standard is designed for wallets that run in browser extensions and attach themselves to the window.

Wallets that require a dapp to load libraries or open popup windows cannot be detected in the same way.

While these other wallets should attempt to have generally compatible interfaces, we do not design specifically for them here.

We should design for maximum compatibility across this standard, the SMS mobile wallet adapter, and Wallet Adapter.

### Wallet Adapter will still be used by dapps

Many dapps use wallet adapter to maximize their support for wallets and for state management.

Some popular wallets do not use browser extensions, so wallet adapter will still be needed.

Wallet Adapter will support and integrate this standard, and dapps will be encouraged to update.

Dapps should be able to update Wallet Adapter to support this standard without significant changes to dependencies or code.

No breaking changes is the goal. Wallet Adapter should abstract changes and deprecate current APIs as needed.

### Present a predictable interface for wallets to attach to the window

When a dapp loads, it should detect all wallets that have already attached themselves to the window.

After loading, a dapp should always detect any new wallet immediately when it attaches itself to the window.

A dapp should have no special logic for detecting any specific wallet.

It should be impossible for conflicts between individual wallet browser extensions to prevent any wallet from being detected.

### `window.solana.wallets` is the namespace reserved for the global interface

While this practice has been discouraged for the last year, several existing wallets still use `Object.defineProperty` to write to `window.solana`.

For compatibility with these wallets and to prevent confusion for devs and users, we will only augment this object if it exists.

Nevertheless, all wallets should continue to migrate away from using `window.solana`, because future standards may extend this.

Wallet Adapter has been doing its part to discourage use of this by consistently not accepting new adapters that use `window.solana`.

The remaining few wallets that still use it should outline a migration plan with a specific timeline.

### Decouple the state of the wallet UI from the state of the dapp UI

Wallets should be presented as stateless, isolated, multi-tenant applications to dapps.

When a dapp acts upon a wallet, it should have no effect on any other dapp that may interact with the wallet.

Similarly, when a user interacts with the wallet UI, it should have no effect on any dapp.

When a user changes accounts or networks in the wallet, their intent is to see their assets or act with them _inside the wallet_.

After a dapp has connected to a wallet and discovered an account, the dapp should be able to request to sign using that account specifically.

When this occurs, the wallet should display account and network changes to sign and send transactions for the dapp, and then switch back.

### Standardize feature support

Wallets inconsistently support signing and sending transactions, signing more than one transaction, signing a "message" (arbitrary byte array), and encryption and decryption.

To the extent they support these, they have different interfaces for them, and many wallets have behaviors that are not secure.

This standard will cover support for

- signing one or more transactions
- signing and sending one or more transactions
- signing one or more "messages" (arbitrary byte arrays)
- encryption and decryption

### No web3.js dependency

The standard does not depend on `@solana/web3.js` or use it in its implementation.

web3.js is large and class-based, has many dependencies, and is likely to be substantially rewritten.

Some wallets don't use web3.js to minimize the security surface of their code.

The interface in the standard will always input and output transactions, pubkeys, and signatures as raw bytes (`Uint8Array`).

Wallet Adapter will encode these as web3.js `Transaction`, `PublicKey`, and Base58 strings as needed for compatibility with dapps.

### Network is used for simulation

When signing a transaction (not just when signing and sending), a network parameter should be provided.

The recent blockhash of the transaction should be valid for the cluster, and simulation should succeed.

Wallets should treat failed simulation of transactions as a security issue and avoid returning signed transactions.

Signing and sending from the wallet should still be the preferred interface, for security.

### APIs should be versioned

The API for window objects and the API for wallets should both be versioned semantically.

Dapps should be able to detect available features based on known API versions.

Multiple versions should be able to coexist to the greatest extent possible.

### API methods should handle multiple inputs

`doThing` and `doAllThings` is an antipattern.

Methods should accept arrays rather than singular objects wherever it makes sense.

Wallets can choose to not support multiple inputs by throwing an error.

This is consistent with the SMS mobile wallet adapter SDK design.

Wallet Adapter will abstract over this interface to avoid breaking changes, while deprecating its current API.

### API methods treat data as immutable

Readonly bytes and primitive types should be the only inputs and outputs.

Wallets must not modify `Uint8Array` instances. Copy on write and return the copy.

### Multiple accounts should be supported

With the user's permission, dapps should be able to discover multiple accounts in the wallet.

Wallets need a way to them to be securely enumerated, and inform dapps when there are accounts it doesn't know about.

### Partial signatures and meta-transactions should be supported

Browser extensions that use programs and relayers for multisig and paying transaction fees for users must be supported.

In practice, this just means that transaction signing interfaces must return serialized transaction objects, not just signatures.

Because API data is immutable, this should be a natural default.

### Wallets embed their own interface and metadata

Wallet names and icons should be provided by the wallet.

Image files should be encoded with data URLs to avoid extra HTTP load.

### Provide a reference implementation

A browser extension wallet that implements minimal functionality should be created.

This will act as a reference implementation and let us test the practicability of the design.

A dapp that implements limited functionality should also be created.

This will let us determine whether any breaking changes to Wallet Adapter are required.

## Open Questions

These are questions about how we should design the standard that haven't been incorporated into the above principles.

### How should autoconnect work?

Dapps are currently expected to remember which wallet they connected to, and autoconnect connects to whatever account the wallet defaults to or currently displays.

This violates the design principle that dapp and wallet UI must be decoupled from each other.

Instead, dapps should remember (e.g. via LocalStorage) which wallet they connected to _and_ the public key to pass to the `connect` method.

If the authorization is not found (was never created, or was revoked), the wallet can present UI to select one or more accounts.

If the wallet also remembers the authorization for the dapp, they don't need to present UI to the user to confirm the connection.

Do dapps need a way to express that they want to connect, but only if an existing authorization is found?

### Do we need an event for when an account is added to a wallet?

If an account is added to a wallet while a dapp is already connected, the dapp has no way to know.

The dapp could only find this by polling the wallet for available accounts, which may cause the wallet to present UI for authorization.

Even the user refreshing the dapp won't cause account changes to be detected if the dapp autoconnects to accounts it already knows about.

We should consider emitting an opaque event when accounts are added or removed.

The event should not contain information about what accounts changed, only that the set of accounts has changed.

The dapp can choose whether to ask for authorization to discover available accounts.

The wallet can choose how this authorization should be handled. For example, it could allow a dapp to see all accounts or only select accounts.

If an account was added when the user isn't on the dapp, how can the dapp know about this when it loads?
