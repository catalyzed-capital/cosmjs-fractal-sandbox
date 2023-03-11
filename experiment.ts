import { DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing';
import {
assertIsDeliverTxSuccess,
SigningStargateClient,
StdFee,
calculateFee,
GasPrice,
coins,
defaultRegistryTypes,
} from '@cosmjs/stargate';
import { Registry } from '@cosmjs/proto-signing';
import { MsgRequestExchange } from '/Users/ccteam/fractal/ts-client/fractal.fractal/types/fractal/fractal/tx';

const myRegistry = new Registry(defaultRegistryTypes);
myRegistry.register('/fractal.fractal.MsgRequestExchange', MsgRequestExchange);

(async () => {
const wallet = await createAddress();
await sendTransaction(wallet);
})();

async function createAddress(): Promise<OfflineSigner> {
const mnemonic =
'obvious bomb elbow report enable sketch night oblige gospel essay busy art';
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);

return wallet;
}

async function sendTransaction(wallet: OfflineSigner) {
const rpcEndpoint = 'http://localhost:26657';
const client = await SigningStargateClient.connectWithSigner(
rpcEndpoint,
wallet,
{ registry: myRegistry },
);

const amount = coins(1, 'token');

const [firstAccount] = await wallet.getAccounts();
const firstAccountAddress = firstAccount.address;

const defaultGasPrice = GasPrice.fromString('0.025token');
const defaultSendFee: StdFee = calculateFee(80_000, defaultGasPrice);

console.log('accounts:', await wallet.getAccounts());
console.log('transactionFee', defaultSendFee);
console.log('amount', amount);
console.log('creator', firstAccountAddress);

const msg: MsgRequestExchange = {
creator: firstAccount.address,
finalunit: 'usd',
amount: '200',
startunit: 'usdc',
unitratio: '2',
settledate: '100',
};
const msgAny = {
typeUrl: '/fractal.fractal.MsgRequestExchange',
value: msg,
};
const fee = {
amount: [
{
denom: 'token',
amount: '1',
},
],
gas: '80000',
};
const memo = 'Exchange Requested';
const result = await client.signAndBroadcast(
firstAccount.address,
[msgAny],
fee,
memo,
);
assertIsDeliverTxSuccess(result);
console.log('Successfully broadcasted:', result);
}