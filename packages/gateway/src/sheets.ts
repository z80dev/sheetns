import { Database } from './server';
import { google, sheets_v4 } from 'googleapis';

interface NameData {
  addresses?: { [coinType: number]: string };
  text?: { [key: string]: string };
  contenthash?: string;
}

type ZoneData = { [name: string]: NameData };

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const EMPTY_CONTENT_HASH = '0x';

export class SheetsDatabase implements Database {
  data: ZoneData;
  ttl: number;
  apiKey: string;
  sheetClient: sheets_v4.Sheets;
  sheetId: string;

  constructor(data: ZoneData, ttl: number, key: string, sheetId: string) {
    this.apiKey = key
    this.sheetClient = google.sheets({
      version: 'v4',
       auth: key
    })

    this.sheetId = sheetId

    // Insert an empty synthetic wildcard record for every concrete name that doesn't have one
    // This is to ensure that if '*.eth' exists and 'test.eth' exists, 'blah.test.eth' does not resolve to '*.eth'.
    this.data = Object.assign({}, data);
    for (const k of Object.keys(this.data)) {
      if (!k.startsWith('*.') && !this.data['*.' + k]) {
        this.data['*.' + k] = {};
      }
    }
    this.ttl = ttl;
    setInterval(() => { this.sync().then(console.log) }, 5000)
  }

  static fromApiKey(key: string, sheetId: string) {
    return new SheetsDatabase({}, 100, key, sheetId)
  }

  async sync() {
    const nameData = Object()
    nameData['addresses'] = Object()
    nameData['text'] = Object()

    const params = {
      spreadsheetId: this.sheetId,
      includeGridData: true,
    }

    const res = await this.sheetClient?.spreadsheets.get(params)

    let [sheetData] = res?.data.sheets!
    let [{rowData}] = sheetData.data!
    let [columns, ...data] = rowData!
    let cols = []
    for (let col of columns.values ?? []) {
      console.log(col.userEnteredValue)
      cols.push(col.userEnteredValue?.stringValue)
    }
    for (let row of data) {
      let name = row.values?.find((_, ind) => ind == 0)?.userEnteredValue?.stringValue ?? ""
      nameData[name] = Object()
      nameData[name]["addresses"] = Object()
      nameData[name]["text"] = Object()
      for (let i = 1; i < (row.values?.length ?? 0); i++) {
        let colname = cols[i]
        let val = row.values?.find((_, ind) => ind == i )?.userEnteredValue?.stringValue
        let colparts = colname?.split(":", 2)
        if (colparts?.length == 2) {
          nameData[name][colparts[0]][colparts[1]] = val
        }
      }
    }
    this.data = nameData
    return true
  }

  addr(name: string, coinType: number) {
    const nameData = this.findName(name);
    if (!nameData || !nameData.addresses || !nameData.addresses[coinType]) {
      return { addr: ZERO_ADDRESS, ttl: this.ttl };
    }
    return { addr: nameData.addresses[coinType], ttl: this.ttl };
  }

  text(name: string, key: string) {
    const nameData = this.findName(name);
    if (!nameData || !nameData.text || !nameData.text[key]) {
      return { value: '', ttl: this.ttl };
    }
    return { value: nameData.text[key], ttl: this.ttl };
  }

  contenthash(name: string) {
    const nameData = this.findName(name);
    if (!nameData || !nameData.contenthash) {
      return { contenthash: EMPTY_CONTENT_HASH, ttl: this.ttl };
    }
    return { contenthash: nameData.contenthash, ttl: this.ttl };
  }

  private findName(name: string) {
    if (this.data[name]) {
      return this.data[name];
    }

    const labels = name.split('.');
    for (let i = 1; i < labels.length + 1; i++) {
      name = ['*', ...labels.slice(i)].join('.');
      if (this.data[name]) {
        return this.data[name];
      }
    }
    return null;
  }
}
