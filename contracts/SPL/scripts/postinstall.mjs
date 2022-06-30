#!/usr/bin/env zx

import "zx/globals";
import env from "@chainized/config";

$.verbose = false;

await $`solana config set --url ${env.SOLANA_NETWORK} -k ${env.SOLANA_ID}`;
echo(`Configured Solana CLI: ${env.SOLANA_CONFIG}`);

await $`${env.SOLANA_KEYPAIR} > ${env.SOLANA_ID}`;

try {
  await $`solana-keygen new -o ${env.SOLANA_ID} -s --no-bip39-passphrase`;
  echo(
    `Generated new wallet: ${await $`solana-keygen pubkey ${env.SOLANA_ID}`}`
  );
} catch (error) {
  echo(
    `Using existing wallet: ${await $`solana-keygen pubkey ${env.SOLANA_ID}`}`
  );
}

let SOLANA_PK = await $`solana-keygen pubkey ${env.SOLANA_ID}`;
await $`solana-keygen verify ${SOLANA_PK} ${env.SOLANA_ID}`;

await $`cp ${env.SOLANA_ID} ./../../packages/config/solana/id.json`;
await $`cp ${env.SOLANA_CONFIG} ./../../packages/config/solana/config.yaml`;

let airdropRawMessage =
  await $`solana airdrop 2 --skip-seed-phrase-validation -C ${env.SOLANA_CONFIG} --output json`;

let signatureProcessing;
airdropRawMessage
  .toString()
  .split(`\n`)
  .slice(1, 4)
  .map((line) => {
    signatureProcessing = signatureProcessing + line;
    return line;
  });

const airdropSignature = JSON.parse(signatureProcessing.slice(9)).signature;

await $`solana confirm ${airdropSignature} -C ${env.SOLANA_CONFIG}`;

echo(
  `Balance: ${await $`solana balance ${env.SOLANA_ID} -C ${env.SOLANA_CONFIG}`}`
);
