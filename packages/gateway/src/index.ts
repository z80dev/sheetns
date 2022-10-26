import { makeApp } from './server';
import { Command } from 'commander';
import { ethers } from 'ethers';
import { SheetsDatabase } from './sheets'
const API_KEY = process.env.API_KEY ?? ""
const program = new Command();
program
  .option('-t --ttl <number>', 'TTL for signatures', '300')
  .option('-p --port <number>', 'Port number to serve on', '8080');
program.parse(process.argv);
const options = program.opts();
console.log(options)
// let privateKey = options.privateKey;
let privateKey = process.env.PRIV_KEY ?? "";
let sheet = process.env.SHEET_ID ?? "";
console.log("Private key");
console.log(privateKey);
console.log("Sheet");
console.log(sheet);
const address = ethers.utils.computeAddress(privateKey);
console.log(address);
const signer = new ethers.utils.SigningKey(privateKey);
const sdb = SheetsDatabase.fromApiKey(API_KEY, sheet)
sdb.sync().then(console.log)
const app = makeApp(signer, '/', sdb);
console.log(`Serving on port ${options.port} with signing address ${address}`);
app.listen(parseInt(options.port));

module.exports = app;
