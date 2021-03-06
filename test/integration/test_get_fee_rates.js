const {test} = require('tap');

const {createCluster} = require('./../macros');
const {delay} = require('./../macros');
const getFeeRates = require('./../../getFeeRates');
const openChannel = require('./../../openChannel');

const confirmationCount = 20;

// Getting fee rates should return the fee rates of nodes in the channel graph
test(`Get fee rates`, async ({end, equal}) => {
  const cluster = await createCluster({});

  const {lnd} = cluster.control;

  await delay(3000);

  const channelOpen = await openChannel({
    lnd,
    partner_public_key: cluster.target_node_public_key,
    socket: `${cluster.target.listen_ip}:${cluster.target.listen_port}`,
  });

  await delay(2000);

  await cluster.generate({count: confirmationCount});

  await delay(2000);

  const {channels} = await getFeeRates({lnd});

  equal(channels.length, [channelOpen].length, 'Channel was opened');

  const [channel] = channels;

  equal(channel.base_fee, 1, 'Channel base fee');
  equal(channel.fee_rate, 1, 'Channel fee rate');
  equal(channel.transaction_id, channelOpen.transaction_id, 'Channel tx id');
  equal(channel.transaction_vout, channelOpen.transaction_vout, 'Tx vout');

  await cluster.kill({});

  return end();
});

