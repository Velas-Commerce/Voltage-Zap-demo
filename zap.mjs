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
  console.info('starting lnd-grpc...');

  // try {
  //   console.info('disconneting...');
  //   await grpc.disconnect()
  // } catch (error) {
  //   console.error(`LND disconnect failed: ${error.message}`)
  // }

  try {
    console.log("connecting...")
    await grpc.connect()
    console.log("connected...")

    console.info("waiting to be active state...")
    await grpc.waitForState('active')
    console.info("state is active???: ", grpc.state)

    // await grpc.activateLightning()
    // grpc.once('active', async () => {
    //   console.info('GRPC state active')
    // })
  } catch (error) {
    console.error(`LND disconnect failed: ${error.message}`)
  }
  
//   // // Do something if the wallet gets unlocked.
//   // grpc.on(`active`, () => console.log('wallet unlocked!'))

//   // // Do something when the connection gets disconnected.
//   // grpc.on(`disconnected`, () => console.log('disconnected from lnd!'))
  
//   // // Check if the wallet is locked and unlock if needed.
//   // if (grpc.state === 'locked') {
//   //     const { WalletUnlocker } = grpc.services
//   //     await WalletUnlocker.unlockWallet({
//   //         wallet_password: Buffer.from(WALLET_PASSWORD),
//   //     })
  
//   //     // After unlocking the wallet, activate the Lightning service and all of it's subservices.
//   //     await WalletUnlocker.activateLightning()
//   // }

//   // assert(grpc.can('activateLightning'));

//   // await grpc.waitForState('active');
//   // console.log(`state: ${grpc.state}`); 

//   // await grpc.activateLightning();

//   // const { Lightning, Invoices } = grpc.services

//   // await Lightning.getInfo();

//   // await grpc.disconnect()
};


await main();