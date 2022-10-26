import { makeApp } from './server';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { ethers } from 'ethers';
// import { JSONDatabase } from './json';
import { SheetsDatabase } from './sheets'
const API_KEY = process.env.API_KEY ?? ""
const program = new Command();
program
  .requiredOption(
    '-k --private-key <key>',
    'Private key to sign responses with. Prefix with @ to read from a file'
  )
  .requiredOption('-s --sheet <string>', 'Google Sheet ID Containing address data')
  .requiredOption('-d --data <file>', 'JSON file to read data from')
  .option('-t --ttl <number>', 'TTL for signatures', '300')
  .option('-p --port <number>', 'Port number to serve on', '8080');
program.parse(process.argv);
const options = program.opts();
let privateKey = options.privateKey;
if (privateKey.startsWith('@')) {
  privateKey = ethers.utils.arrayify(
    readFileSync(privateKey.slice(1), { encoding: 'utf-8' })
  );
}
const address = ethers.utils.computeAddress(privateKey);
const signer = new ethers.utils.SigningKey(privateKey);
// const db = JSONDatabase.fromFilename(options.data, parseInt(options.ttl));
const sdb = SheetsDatabase.fromApiKey(API_KEY, options.sheet)
sdb.sync().then(console.log)
const app = makeApp(signer, '/', sdb);
console.log(`Serving on port ${options.port} with signing address ${address}`);
app.listen(parseInt(options.port));

module.exports = app;
