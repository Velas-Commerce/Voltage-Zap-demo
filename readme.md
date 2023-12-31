# Voltage Lightning gRPC Demo

> **Warning: This is a working demo and not meant for production use**

The following is a JavaScript example of using gRPC to interact with Voltage Lightning Network Daemon nodes . It makes use of the `@grpc/grpc-js` and `@grpc/proto-loader` packages to load the LND proto files and to establish a connection to the LND node.

The voltage.js script implements a number of the proto methods from lightning.proto and includes an example grpc streaming service that subscribes to bolt 11 invoices.

## Dependencies

The following packages are required for this code to run:

- `fs`
- `@grpc/grpc-js`
- `@grpc/proto-loader`

## Environment Variables

Ensure the following environment variables are set:

- `HOST`: The host address of your Lightning node.
- `MACAROON`: The path to your .macaroon file.
- `LIGHTNING_PROTO`: The path to your .proto file.

## Setup

Before running the code, make sure you have Node.js installed on your system. You can download Node.js from [here](https://nodejs.org/en/download/).

After installing Node.js, navigate to your project directory in the terminal and run the following command to install the necessary dependencies:

```bash
$ npm install
```

## Usage

To run the script, use the following command in your terminal:

```bash
$ npm run voltage
```
This script will output information about the node, channels, and peers. After printing the information, it will start listening for any Bolt11 invoices.

When a bolt11 invoice is generated by the node, the invoice details will be printed to the console.

Quit the listening service anytime with Control+C