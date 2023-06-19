const fs = require("fs");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

let { HOST, MACAROON, LIGHTNING_PROTO } = process.env;

const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const packageDefinition = protoLoader.loadSync(LIGHTNING_PROTO, loaderOptions);

async function main() {
  process.env.GRPC_SSL_CIPHER_SUITES = "HIGH+ECDSA";

  let m = fs.readFileSync(MACAROON);
  let macaroon = m.toString("hex");

  // build meta data credentials
  let metadata = new grpc.Metadata();
  metadata.add("macaroon", macaroon);
  let macaroonCreds = grpc.credentials.createFromMetadataGenerator(
    (_args, callback) => {
      callback(null, metadata);
    }
  );

  // build ssl credentials without needing to pass in the cert
  const sslCreds = grpc.credentials.createSsl();
  // cert
  // let lndCert = fs.readFileSync(CERT);
  // let sslCreds = grpc.credentials.createSsl(lndCert);

  // combine the cert credentials and the macaroon auth credentials
  // such that every call is properly encrypted and authenticated
  let credentials = grpc.credentials.combineChannelCredentials(
    sslCreds,
    macaroonCreds
  );

  // Pass the crendentials when creating a channel
  let lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
  let lnrpc = lnrpcDescriptor.lnrpc;

  let client = new lnrpc.Lightning(HOST, credentials);

  // getInfo
  client.getInfo({}, (err, response) => {
    if (err) {
      console.log("Error: " + err);
    }
    console.log("GetInfo:", response);
  });

  // addInvoice
  let requestAddInvoice = {
    memo: "test from node.js",
    value: 200,
  };
  client.addInvoice(requestAddInvoice, function (err, response) {
    console.log("Invoice:", response);
  });

  // listChannels
  let requestListChannels = {
    active_only: true,
    // inactive_only: true,
    public_only: true,
    // private_only: true,
    // peer: <bytes>,
  };
  client.listChannels(requestListChannels, function (err, response) {
    console.log("listChannels:", response);
  });

  // walletBalance
  let walletBalanceRequest = {};
  client.walletBalance(walletBalanceRequest, function (err, response) {
    console.log("walletBalance:", response);
  });
  client.WalletBalance({}, function (err, response) {
    console.log("WalletBalance:", response);
  });

  // listpeers
  let requestListPeers = {
    // latest_error: <string>,
    // peer: <bytes>,
  };
  client.listPeers(requestListPeers, function (err, response) {
    console.log("listPeers:", response);
  });

  // implement the rpc SubscribeInvoices streaming service
  let requestSubscribeInvoices = {
    // add_index: <uint64>,
    // settle_index: <uint64>,
  };
  client.subscribeInvoices(requestSubscribeInvoices, function (err, response) {
    console.log("subscribeInvoices:", response);
  });

  // test the subscribeInvoices streaming service
  let call = client.subscribeInvoices({});
  call.on("data", function (invoice) {
    console.log("invoice:", invoice);
  });
  call.on("end", function () {
    console.log("end");
  });
  call.on("status", function (status) {
    console.log("status:", status);
  });
  call.on("error", function (err) {
    console.log("error:", err);
  });
}

main();
