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

  client.getInfo({}, (err, response) => {
    if (err) {
      console.log("Error: " + err);
    }
    console.log("GetInfo:", response);
  });

  let requestAddInvoice = {
    memo: "test from node.js",
    value: 200,
  };
  client.addInvoice(requestAddInvoice, function (err, response) {
    console.log("Invoice:", response);
  });

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
}

main();
