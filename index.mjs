import assert from 'assert';
import 'dotenv/config'
import LndGrpc from 'lnd-grpc'

let {HOST,CERT,MACAROON,WALLET_PASSWORD} = process.env;

const grpc = new LndGrpc({
  host: HOST,
  cert: CERT,
  macaroon: MACAROON,
  waitForCert: true,
  waitForMacaroon: true,
})

var main = async () => {
  await grpc.connect()

  // Do something if the wallet gets unlocked.
  grpc.on(`active`, () => console.log('wallet unlocked!'))

  // Do something when the connection gets disconnected.
  grpc.on(`disconnected`, () => console.log('disconnected from lnd!'))
  
  // Check if the wallet is locked and unlock if needed.
  if (grpc.state === 'locked') {
      const { WalletUnlocker } = grpc.services
      await WalletUnlocker.unlockWallet({
          wallet_password: Buffer.from(WALLET_PASSWORD),
      })
  
      // After unlocking the wallet, activate the Lightning service and all of it's subservices.
      await WalletUnlocker.activateLightning()
  }

  assert(grpc.can('activateLightning'));

  await grpc.waitForState('active');
  console.log(`state: ${grpc.state}`); 

  // await grpc.activateLightning();

  const { Lightning, Autopilot, Invoices } = grpc.services

  await grpc.disconnect()
};


main();

// console.log(Lightning)

// const balance = await Lightning.walletBalance()
// console.log(balance);

// console.log("grpc is now disconnected");