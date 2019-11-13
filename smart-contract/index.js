const getStdin = require('get-stdin');
const handler = require('./contract/handler');

async function main() {
  const val = await getStdin();
  try {
    const res = await handler(val);
    process.stdout.write(JSON.stringify(res));
  } catch (err) {
    return console.error(err);
  }
}

main().catch(console.error);