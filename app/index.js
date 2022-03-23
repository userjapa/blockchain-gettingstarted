const express = require('express')

const P2pServer = require('./p2p-server'),
      Miner     = require('./miner')

const Blockchain      = require('../blockchain'),
      Wallet          = require('../wallet'),
      TransactionPool = require('../wallet/transaction-pool')

const HTTP_PORT = process.env.HTTP_PORT || 3001

const app = express()

const bc        = new Blockchain(),
      wallet    = new Wallet(),
      tp        = new TransactionPool(),
      p2pServer = new P2pServer(bc, tp),
      miner     = new Miner(bc, tp, wallet, p2pServer)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/blocks', (req, res) => {
  res.json(bc.chain)
})

app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data)
  console.log(`New block added: ${block.toString()}`)

  p2pServer.syncChains()

  res.redirect('/blocks')
})

app.get('/transactions', (req, res) => {
  res.json(tp.transactions)
})

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body

  const transaction = wallet.createTransaction(recipient, amount, bc, tp)

  p2pServer.broadcastTransaction(transaction)

  res.redirect('/transactions')
})

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine()

  console.log(`New block added: ${block.toString()}`)

  res.redirect('/blocks')
})

app.get('/public-key', (req, res) => {
  res.json({
    publicKey: wallet.publicKey
  })
})

app.listen(HTTP_PORT, () => {
  console.log(`Listening at port ${HTTP_PORT}`)
})

p2pServer.listen()
