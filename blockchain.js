const crypto = require('crypto');

/** A single block in the chain */
class Block {
    /**
     * @param {number} index
     * @param {string} timestamp - e.g., Date.now().toString()
     * @param {any} data - transaction payload (object or array)
     * @param {string} previousHash - hex string of prev block hash
     */
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0; // used for mining
        this.hash = this.calculateHash();
    }

    /** Compute SHA-256 over the block’s contents */
    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                String(this.index) +
                this.timestamp +
                JSON.stringify(this.data) +
                this.previousHash +
                String(this.nonce)
            )
            .digest('hex');
    }

    /** Proof-of-Work: find a hash starting with N leading zeros */
    mineBlock(difficulty) {
        const target = '0'.repeat(difficulty);
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
        console.log(`It took ${this.nonce} attempts to mine this block.`);
    }
}

/** A simple blockchain container */
class Blockchain {
    constructor(difficulty = 3) {
        if (difficulty < 3) { //if difficulty is set below 3, send an error
            console.warn('Difficulty cannot be less than 3, setting difficulty to 3'); //verifies that the difficulty can't go below 3
            this.difficulty = 3; //set difficulty to 3 in case it's below
        } else {
            this.difficulty = difficulty; //if equal or above 3, leave it be
        }
        this.chain = [this.createGenesisBlock()];

    }

    createGenesisBlock() {
        return new Block(0, Date.now().toString(), 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Add a new block to the chain.
     * Sets its previousHash, mines it, then appends.
     */
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    /** Verify integrity: hash consistency + correct previousHash links
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i];
            const previous = this.chain[i - 1];
            // recompute hash from the block’s current contents
            if (current.hash !== current.calculateHash()) return false;
            // ensure link matches previous block’s actual hash
            if (current.previousHash !== previous.hash) return false;
        }
        return true;
    }
}

function starter() {
    // 1) Create a chain with a difficulty of 3
    const demoCoin = new Blockchain(3);

    // 2) Add blocks with transactions
    console.log('Mining block #1...');
    demoCoin.addBlock(new Block(1, Date.now().toString(), { from: 'Alice', to: 'Bob', amount: 50 }));

    console.log('\nMining block #2...');
    demoCoin.addBlock(new Block(2, Date.now().toString(), { from: 'Charlie', to: 'Dana', amount: 75 }));

    console.log('\nMining block #3...');
    demoCoin.addBlock(new Block(3, Date.now().toString(), [
        { from: 'Eve', to: 'Frank', amount: 20 },
        { from: 'Gina', to: 'Hank', amount: 10 },
        { from: 'Idina', to: 'Jeffery', amount: 45 }, //5th element in the third block, stored as an object
    ]));

    // 3) Show the chain is valid
    console.log('\nIs chain valid?', demoCoin.isChainValid());

    // 4) Tamper with a block and re-validate
    console.log('\nTampering with block #1 data...');
    demoCoin.chain[1].data.amount = 9999;
    console.log('Is chain valid after tamper?', demoCoin.isChainValid());
}

starter();
