require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require("fs");


let {HOST,CERT,MACAROON,LIGHTNING_PROTO} = process.env;

// Due to updated ECDSA generated tls.cert we need to let gRPC know that
// we need to use that cipher suite otherwise there will be a handshake
// error when we communicate with the lnd rpc server.
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'

// We need to give the proto loader some extra options, otherwise the code won't
// fully work with lnd.
const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

// macaroon
let m = fs.readFileSync(MACAROON);
let macaroon = m.toString('hex');

// build meta data credentials
let metadata = new grpc.Metadata()
metadata.add('macaroon', macaroon)
let macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
  callback(null, metadata);
});

// cert
let lndCert = fs.readFileSync(CERT);
let sslCreds = grpc.credentials.createSsl(lndCert);

// combine the cert credentials and the macaroon auth credentials
// such that every call is properly encrypted and authenticated
let credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

const packageDefinition = protoLoader.loadSync(LIGHTNING_PROTO, loaderOptions);
let lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
let lnrpc = lnrpcDescriptor.lnrpc;

let lightning = new lnrpc.Lightning(HOST, credentials);

lightning.getInfo({}, function(err, response) {
    if (err) {
        console.log('Error: ' + err);
    }
        console.log('GetInfo:', response);
    });