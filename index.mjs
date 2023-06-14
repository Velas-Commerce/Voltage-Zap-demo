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
  console.log("main");
  await grpc.connect()
  console.log("connnected:")
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

  await grpc.activateLightning();

  const { Lightning, Invoices } = grpc.services

  await Lightning.getInfo();

  await grpc.disconnect()
};


await main();