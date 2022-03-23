const TransactionPool = require('./transaction-pool'),
      Transaction     = require('./transaction'),
      Wallet          = require('./index')

const Blockchain = require('../blockchain')

describe('TransactionPool', () => {
  let bc,
      tp,
      wallet,
      transaction

  beforeEach(() => {
    bc = new Blockchain()
    tp = new TransactionPool()
    wallet = new Wallet()
    transaction = wallet.createTransaction('r4nd-4dr355', 30, bc, tp)
  })

  it('adds a transaction to the pool', () => {
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction)
  })

  it('updates a transaction in the pool', () => {
    const oldTransaction = JSON.stringify(transaction)

    const newTransaction = transaction.update(wallet, 'f00-4ddr355', 40)

    tp.updateOrAddTransaction(newTransaction)

    expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction)
  })

  it('clears transactions', () => {
    tp.clear()

    expect(tp.transactions).toEqual([])
  })

  describe('mixing valid and corrupt transactions', () => {
    let validTransactions

    beforeEach(() => {
      validTransactions = [ ...tp.transactions ]

      for (let x = 0; x < 6; x++) {
        wallet = new Wallet()
        transaction = wallet.createTransaction('r4nd-4ddr355', 30, bc, tp)

        if (x % 2 == 0) {
          transaction.input.amount = 9999
        } else {
          validTransactions.push(transaction)
        }
      }
    })

    it('shows difference between valid and corrupt transactions', () => {
      expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions))
    })

    it('grabs valid transactions', () => {
      expect(tp.validTransactions()).toEqual(validTransactions)
    })
  })
})
