#!/usr/bin/env node

const fs = require('fs')
const path = require('path');
const args = process.argv

const chalk = require('chalk')
const childProcess = require('child_process')
const fse = require('fs-extra')
const ejs = require('ejs')

function logError(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}

function logSuccess(string) {
  const sLog = chalk.green(string)
  console.log(sLog)
}

const showHelp = function() {
  const helpText = `
  Generate Decentraland parks.

  usage:

    genparks <command> [<concept-number>] [<park-number>]

    commands can be:

    new:      generate new <concept-number> <park-number>
    help:     show help
  `

  console.log(helpText)
}

// museum blocks list from:
// https://github.com/dcl-project-developers/aetheria-block-museum/blob/master/museumDefinition.csv
//
// block_id,block_name,artwork type,exhibit_name,labels,timestamp,explorer,path_artwork,path_description
// 0,The Genesis,garden,The First Million,"memorable,genesis",Jul-30-2015 03:26:13 PM +UTC,https://etherscan.io/block/0,./exhibits/0/artwork.png,./exhibits/0/description.txt
// 1,The Ethereum Frontier,garden,The First Million,"hardfork,genesis",Jul-30-2015 03:26:28 PM +UTC,https://etherscan.io/block/1,./exhibits/1/artwork.png,./exhibits/1/description.txt
// 762,Oldest One-time Miner,cryptoarte,The First Million,milestone,Jul-30-2015 03:55:08 PM +UTC,https://etherscan.io/block/762,./exhibits/762/artwork.png,./exhibits/762/description.txt
// 88090,The First ICO: Augur,cryptoarte,The First Million,"memorable, tokensale",Aug-15-2015 01:34:16 AM +UTC,https://etherscan.io/block/88090,./exhibits/88090/artwork.png,./exhibits/88090/description.txt
// 515000,DevCon-1: London,garden,The First Million,milestone,Nov-09-2015 05:54:45 PM +UTC,https://etherscan.io/block/515000,./exhibits/515000/artwork.png,./exhibits/515000/description.txt

// 1000000,One Million Blocks,cryptoarte,Early Days – theDAO,milestone,Feb-13-2016 10:54:13 PM +UTC,https://etherscan.io/block/1000000,./exhibits/1000000/artwork.png,./exhibits/1000000/description.txt
// 1150000,Homestead Fork,garden,Early Days – theDAO,hardfork,Mar-14-2016 06:49:53 PM +UTC,https://etherscan.io/block/1150000,./exhibits/1150000/artwork.png,./exhibits/1150000/description.txt
// 1428757,theDAO is deployed,cryptoarte,Early Days – theDAO,"memorable, theDAO, tokensale",Apr-30-2016 01:42:58 AM +UTC,https://etherscan.io/block/1428757,./exhibits/1428757/artwork.png,./exhibits/1428757/description.txt
// 1718497,theDAO is drained,cryptoarte,Early Days – theDAO,"infamous, theDAO",Jun-17-2016 03:34:48 AM +UTC,https://etherscan.io/block/1718497,./exhibits/1718497/artwork.png,./exhibits/1718497/description.txt
// 1920000,theDAO Fork,garden,Early Days – theDAO,"hardfork,theDAO",Jul-20-2016 01:20:40 PM +UTC,https://etherscan.io/block/1920000,./exhibits/1920000/artwork.png,./exhibits/1920000/description.txt

// 2283416,EXTCODESIZE DoS Attack,cryptoarte,Denial of Service,"infamous, DoSAttacks",Sep-18-2016 06:04:56 PM +UTC  ,https://etherscan.io/block/2283416,./exhibits/2283416/artwork.png,./exhibits/2283416/description.txt
// 2290000,DevCon-2: Shanghai,garden,Denial of Service,"milestone, DoSAttacks, theDAO",Sep-19-2016 08:36:02 PM +UTC,https://etherscan.io/block/2290000,./exhibits/2290000/artwork.png,./exhibits/2290000/description.txt
// 2421507,“Suicide Bomb” DoS Attack,cryptoarte,Denial of Service,"infamous, DoSAttacks",Oct-11-2016 03:55:16 PM +UTC ,https://etherscan.io/block/2421507,./exhibits/2421507/artwork.png,./exhibits/2421507/description.txt
// 2463000,Tangerine Whistle,cryptoarte,Denial of Service,"hardfork,DoSAttacks",Oct-18-2016 01:19:31 PM +UTC,https://etherscan.io/block/2463000,./exhibits/2463000/artwork.png,./exhibits/2463000/description.txt
// 2675000,Spurious Dragon,cryptoarte,Denial of Service,"hardfork,DoSAttacks",Nov-22-2016 04:15:44 PM +UTC,https://etherscan.io/block/2675000,./exhibits/2675000/artwork.png,./exhibits/2675000/description.txt

// 3141592,The Most Recent Pi Block,garden,The Bull Times,milestone, Feb-07-2017 08:44:26 PM +UTC,https://etherscan.io/block/3141592,./exhibits/3141592/artwork.png,./exhibits/3141592/description.txt
// 4041169,Parity Multisig Public Init Hack ,garden,The Bull Times,"infamous, tokensale",Jul-18-2017 10:28:36 PM +UTC ,https://etherscan.io/block/4041169,./exhibits/4041169/artwork.png,./exhibits/4041169/description.txt
// 4170700,Decentraland MANA sale startBlock,cryptoarte,The Bull Times,"memorable, dapp, tokensale",Aug-17-2017 09:21:54 PM +UTC,https://etherscan.io/block/4170700,./exhibits/4170700/artwork.png,./exhibits/4170700/description.txt
// 4321454,The Terraform Event,garden,The Bull Times,"memorable, dapp",Sep-29-2017 09:09:19 AM +UTC,https://etherscan.io/block/4321454,./exhibits/4321454/artwork.png,./exhibits/4321454/description.txt
// 4370000,Metropolis Byzantium,garden,The Bull Times,hardfork,Oct-16-2017 05:22:11 AM +UTC,https://etherscan.io/block/4370000,./exhibits/4370000/artwork.png,./exhibits/4370000/description.txt

// 4470000,DevCon-3: Cancun,garden,The Peak of Inflated Expectations,"milestone, tokensale",Nov-01-2017 11:35:19 AM +UTC,https://etherscan.io/block/4470000,./exhibits/4490000/artwork.png,./exhibits/4490000/description.txt
// 4501969,Parity Multisig Library Suicide,cryptoarte,The Peak of Inflated Expectations,"infamous, tokensale",Nov-06-2017 03:25:21 PM +UTC ,https://etherscan.io/block/4501969,./exhibits/4501969/artwork.png,./exhibits/4501969/description.txt
// 4605346,CryptoKitty #1 is born,garden,The Peak of Inflated Expectations,"memorable, dapp",Nov-23-2017 06:19:59 AM +UTC,https://etherscan.io/block/4605346,./exhibits/4605346/artwork.png,./exhibits/4605346/description.txt
// 4752008,The Birth of the DAI,cryptoarte,The Peak of Inflated Expectations,memorable,Dec-18-2017 03:10:38 AM +UTC,https://etherscan.io/block/4752008,./exhibits/4752008/artwork.png,./exhibits/4752008/description.txt
// 6610000,DevCon-4: Prague,garden,The Peak of Inflated Expectations,"milestone, buidl",Oct-30-2018 06:54:19 AM +UTC,https://etherscan.io/block/6610000,./exhibits/6610000/artwork.png,./exhibits/6610000/description.txt

const sourceParkDataArr = [
  {parkNumber: 1,   name: 'The Genesis',                                blockNumber: 0,       hash: 'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3', 
  description: [
    'The Genesis block is one-of-a-kind:',
    'it contains 8893 transactions but',
    'has used no gas, it was created 15',
    'seconds before the Ethereum Frontier',
    'at block #1, but it has no miner. And',
    'More importantly, its nonce is 0x42!',
    '',
    'The Genesis block was shipped with',
    'the first clients and was designed to',
    'initialize the account of each',
    'participants of the Ethereum presale.',
    'The presale ran for 42 days startingin',
    'July 2014, the initial price was fixed',
    'to 2000 ETH/BTC ($0.311/ETH at the',
    'time) for two weeks. After that period,',
    'the price would decrease linearly until',
    'it reached 1337 ETH/BTC. The presale',
    'had been delayed by several months so',
    'the team could navigate the legal',
    'processes and build a secure presale',
    'website.',
    '',
    'The presale website would generate an',
    'encrypted wallet.json file, all',
    'client-side, and associate it with a',
    'Bitcoin address the participants had',
    'to contribute to. That wallet contained',
    'the private key needed to access the',
    'accounts created during the genesis',
    'block (assuming you had not forgotten',
    'your password!).',
    '',
    'In total, some over 60M ETH were sold',
    'at the presale for roughly 61,150 BTC',
    'worth over $18M at the time.'
  ]
},
  {parkNumber: 2,   name: 'The Ethereum Frontier',                      blockNumber: 1,       hash: '88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6',
  description: [
    'The beginning: a catalyst that would',
    'inspire some of the greatest',
    'technological advances of the modern',
    'era. A pioneering project, as it were,',
    'Ethereum was considered by many as a',
    'key element of building the next',
    'iteration of the web. It would allow',
    'anyone access to a new type of public',
    'utility: a global virtual machine',
    'which could be used by anyone to',
    'interact with other people and with',
    'digital money, all simply by writing',
    'code defining the nature of the',
    'interactions. The accuracy of the code',
    'execution would be guaranteed similarly',
    'to how transactions are verified with',
    'Bitcoin. This would enable new ways',
    'for people to organize and would remove',
    'the need to trust other parties in many',
    'cases. This block is where it all began.',
    '',
    'The development of Ethereum started with',
    'a proof-of-concept series completing 9',
    'cycles, with the 10th iteration',
    'resulting in the Olympic testnet in',
    'May 2015. Developers were incentivized',
    'via prizes to: “test the limits of the',
    'Ethereum blockchain during the',
    'pre-release period, spamming the network',
    'with transactions and doing crazy things',
    'with the state, so that we can see how',
    'the network holds up under high levels',
    'of load.” There was even a 5000 ETH',
    'grand prize for whoever could create a',
    'fork between the two main clients, the',
    'go and the C++ clients.',
    '',
    'After a few months of testing, the first',
    'mainnet, Frontier, was publicly released',
    'on July 30th 2015, when the first',
    'clients consented to the network via the',
    'genesis block. In the early days it',
    'provided a decentralized, distributed',
    'platform for application development —',
    'but unfortunately very few development',
    'tools existed. New features and',
    'improvements to the friendliness of the',
    'platform would be implemented throughout',
    'the following years.',
    '',
    'The early users - who participated in',
    'the Ethereum presale, and, above all,',
    'performed Ethereum mining, building,',
    'and testing of smart contracts - were',
    'utterly passionate about the',
    'technology. Ethereum aimed to answer the',
    'question of “In what way can I program',
    'my cryptocurrency?” thus introducing a',
    'brave new world of discovery and',
    'innovation.'
  ]
},
  {parkNumber: 3,   name: 'Oldest One-time Miner',                      blockNumber: 762,     hash: 'd898664323723661c037e39cd24e7290dee0ffe3aa1a62f3cb0ace3034814403',
  description: [
    'Nowadays, the majority of PoW chains',
    'are secured by large pool miners. If',
    'you have a GPU available and want to',
    'start mining, the only realistic',
    'solution is to join a mining pool and',
    'combine your efforts with that of many',
    'other miners in your situation. You',
    'then share the revenue based on your',
    'contribution to the pool hashrate.',
    '',    
    'This was not necessarily the case in',
    'the early days of Ethereum. There are',
    'multiple instances of miners who have',
    'only ever produced a single block:',
    'suggesting they were solo mining with',
    'their own GPU, before perhaps either',
    'ceasing to mine or moving onto a pool',
    'due to hashrate increases.',
    '',
    'The CryptoArte in front of you is',
    'unique, because the miner shape you',
    'observe in its center is ever only',
    'visible once in the entire collection.',
    'This miner is a “one-time miner”, and',
    'in fact is the oldest of such. The',
    'account (see',
    'oneTimeMiner.aetheriablockmuseum.eth)',
    'mined the block #762. It was an empty',
    'block (no transactions), as were most',
    'blocks that early in the life of the',
    'blockchain. The solo-miner received',
    '5.1625 ETH as a reward for mining the',
    'block, and 3.75 reward for including 1',
    'uncle. There are no external or',
    'internal transactions associated with',
    'this account whatsoever; the 8.9 ETH is',
    'still sitting in the account to this',
    'day.'
  ]
},  
  {parkNumber: 4,   name: 'The First ICO: Augur',                       blockNumber: 88090,   hash: '0a7af5a5870648ff8c2c10691ac01e08451d054a15da8c4a843c5393752e2baa',
  description: [
    'Since Ethereum is a generic smart',
    'contract platform, any number of',
    'applications can be built on top of it,',
    'decentralized exchange of value,',
    'multi-party agreement and notably,',
    'fundraising. The first project to raise',
    'funds via Ethereum was Augur, a',
    '“decentralized oracle & prediction',
    'market protocol”. On August 15th 2015,',
    'at block #88,090, the Augur token sale',
    'contract was deployed at',
    'augurTokensale.aetheriablockmuseum.eth.',
    'From this block, until October 1st of',
    'the same year, anyone could send ETH to',
    'that contract in exchange for what',
    'would be called REP tokens. The price',
    'was not fixed per ETH, but instead, a',
    'total of 8.8M REP would be distributed',
    'proportionally to all participants at',
    'the end of the participation period.',
    'This would be known as an “uncapped”',
    'sale. Bitcoin was also accepted, but',
    'managed separately. In total, over',
    '$5.5M USD was contributed, and the 8.8M',
    'REP distributed to over 300 distinct',
    'contributors. Augur notably sold 1M of',
    'the ETH it raised at a time when',
    'Ethereum was worth $0.70. While some',
    'argued that it showed a lack of belief',
    'in the underlying platform (Ethereum),',
    'Joey Krug, the creator of Augur,',
    'rightfully pointed out that the purpose',
    'of the token sale should be to fund',
    'development of the Augur platform, not',
    'speculate on future values of the',
    'cryptocurrencies used for fundraising.',
    '',
    'The ambitious goal of Augur was to',
    'build one of the fundamental building',
    'blocks for the web3: a decentralized',
    'prediction market where speculators',
    'could bet on future events (sports,',
    'political, weather, and more) and cut',
    'the middleman entirely. This building',
    'block could then be used to build more',
    'complex applications such as',
    'decentralized insurance products',
    '(insuring farmers against bad weather).',
    'While Augur was the first project to',
    'raise funds on Ethereum, it took nearly',
    '3 years before the product launched on',
    'mainnet on July 9th of 2018. About 2',
    'weeks later, on July 24th 2018, the',
    'team transferred the ownership of the',
    'mainnet Augur escape hatch to a',
    'burn1.aetheriablockmuseum.eth. Nobody',
    'owns the private keys to this address,',
    'hence anything sent to that address can',
    'be considered “burned”. In the case of',
    'Augur, this was another step toward',
    'complete decentralization of the',
    'platform.',
    '',
    'As of early 2019, there are over 6000',
    'ETH locked in the Augur system.'
  ]
},   
  {parkNumber: 5,   name: 'DevCon-1: London',                           blockNumber: 515000,  hash: '926287a535d7929ab81c0d72eb10f5711b8156d617f61d58b7b04ddab5673f78',
  description: [
    'In November 9-13, 2015 - a little over',
    'a hundred days after the Ethereum',
    'network launched - the first Ethereum',
    'Development Conference made its London',
    'debut. Begging the question of how the',
    'Ethereum platform would push toward',
    'decentralized revolution? About 300',
    'attendees watched eagerly as Dr. Gavin',
    'Wood - Ethereum co-founder - explained',
    'the key concepts as part of his',
    'presentation: “Ethereum for dummies.”',
    '',
    'There had been a DevCon-0 November of',
    'the previous year in Berlin. But this',
    'was before the mainnet launched, so the',
    'event does not have its own entry in',
    'this museum.',
    '',
    'The developers’ conference - which',
    'focused mainly on dapp development -',
    'aimed to educate and inspire the masses',
    'as to the robust future of Ethereum and',
    'to highlight its overwhelming social',
    'implications.'
  ]
},  
  {parkNumber: 6,   name: 'One Million Blocks',                         blockNumber: 1000000, hash: '8e38b4dbf6b11fcc3b9dee84fb7986e29ca0a02cecd8977c161ff7333329681e',
  description: [
    'The block with the number one million',
    'was mined on February 13 2016, nearly',
    '200 days after the mainnet came to',
    'life. This period amounts to roughly',
    '17.1 million seconds, or approximately',
    'one new block every 17 seconds on',
    'average. This metric, known as the',
    'average block time, has varied widely',
    'over the years, sometimes being',
    'significantly higher than the 15',
    'seconds target. A key influencer of',
    'block time is the difficulty bomb. This',
    'mechanism increases the difficulty',
    'exponentially after some time, forcing',
    'the network and the community to',
    'upgrade to a new version through a hard',
    'fork to reset the bomb.'
  ]
},  
  {parkNumber: 7,   name: 'Homestead Fork',                             blockNumber: 1150000, hash: '584bdb5d4e74fe97f5a5222b533fe1322fd0b6ad3eb03f02c3221984e2c0b430',
  description: [
    'The ‘Homestead’ update, released on Pi',
    'Day (March 14th, 2016) at block',
    '1,150,000, is widely considered the',
    'first “stable” Ethereum release.',
    'Initially planned to deploy a month',
    'after Frontier, it actually took the',
    'developers 7.5 months to complete the',
    'extensive project.',
    '',
    'Ethereum forks include a number of',
    'Ethereum Improvement Proposals (EIP).',
    'Homestead implemented 3 EIPs (EIP-2, 7',
    'and 8). These EIPs cover a broad number',
    'of improvements, including an increase',
    'to the cost of contract creation to',
    'address a protocol bug which allowed',
    'value transfer at 11664 gas, the',
    'introduction of the DELEGATECALL opcode',
    'which enabled safer smart contract',
    'design pattern such as proxy contracts,',
    'and changes to the difficulty',
    'calculation, in hope of restoring an',
    'average block time of 15 seconds (which',
    'had recently averaged about 1 block per',
    '13 seconds).'
  ]
}, 
  {parkNumber: 8,   name: 'theDAO is deployed',                         blockNumber: 1428757, hash: '17fea357e1a1a514b45d45db586c272a7415f8eb8aeb4aa1dcaf87e56f34ca59',
  description: [
    'The infamous theDAO contract was',
    'deployed at',
    'theDAO.aetheriablockmuseum.eth on April',
    '30th 2016 and stayed unharmed for about',
    '1.5 months until attackers started',
    'draining the funds. The contract itself',
    'was meant to handle multiple functions',
    'of theDAO including running the presale',
    'and the governance functionality',
    '(DAOInterface) such as newProposal().',
    'The contract also implemented the',
    'ERC-20 interface which had first been',
    'proposed in November of the previous',
    'year.',
    '',
    'The presale started as soon as the',
    'contract was deployed and it was',
    'handled by calling the default function',
    '(also known as fallback function). This',
    'function is called when a transaction',
    'is sent to an address with nothing in',
    'its data field (interaction with smart',
    'contract typically happens with that',
    'field).  For 28 days, participants sent',
    'Ether to that address, and received',
    'theDAO tokens in exchange. By the end',
    'of the sale, about 14% of the total ETH',
    'supply was held in custody by that',
    'contract. By the end of May, a paper',
    'was published to highlight',
    'vulnerabilities; meanwhile 3 weeks',
    'later, the ether raised from the',
    'presale started being drained away.'
  ]
},  
  {parkNumber: 9,   name: 'theDAO is drained',                          blockNumber: 1718497, hash: 'caaa13ce099342d5e1342b04d588d7733093591666af8ef756ce20cf13d16475',
  description: [
    'As the sale was coming to its end, a',
    'blog post titled “A Call for a',
    'Temporary Moratorium on The DAO” was',
    'published by Dino Mark, Vlad Zamfir and',
    'Emin Gun Sirer.The post highlighted',
    'several possible attacks, including The',
    'Stalking Attack. This attack involved',
    'the splitting functionality (the only',
    'way to extract ether from the contract)',
    'and the recursive nature of',
    'sub-contracts, “effectively trapping',
    'the victim’s funds and prohibiting',
    'conversion back to ether." More flaws',
    'related to the recursive nature of',
    'theDAO had been highlighted by various',
    'group and plans had been made to',
    'address some of the problems, when',
    'suddenly it became evident that someone',
    'had figured out a way to exploit a',
    'vulnerability.',
    '',
    'In the early morning of June 17 2016,',
    'at block 1718497, the account at',
    'theDAOAttacker.aetheriablockmuseum.eth',
    'started draining theDAO.',
    '',
    'One of the advertised properties of',
    'theDAO was that it was possible, by',
    'anyone, to retrieve their initial',
    'investment in theDAO. For example: if',
    'they weren’t happy with the direction',
    'that the organization was going with a',
    'certain proposal. This would be',
    'executed by calling splitDAO() which',
    'would refund the money and burn theDAO',
    'tokens. However, the balance on the',
    'initial theDAO contract would only be',
    'updated *after* the ETH had been sent,',
    'thus exposing the contract to recursive',
    'attacks. In this case, the contract',
    'would calculate the funds to be moved;',
    'then payout would occur, then the',
    'balances would be updated. During',
    'payout, the funds would be transferred',
    'from theDAO treasury to the recipient.',
    'What if the recipient was a contract',
    'address? What if the default behavior',
    'on that contract was to call splitDAO',
    'too? Since balances were only updated',
    'later, this would allow someone to get',
    'payouts multiple times before their',
    'balance is updated. The attacker did',
    'exactly that via “The Dark DAO”, their',
    'own malicious child DAO',
    '(theDarkDAO.aetheriablockmuseum.eth).',
    '',
    'Future token sales were designed after',
    'learning from theDAO contract flaws. In',
    'particular, the lack of separation of',
    'concern was addressed by dividing the',
    'logic in multiple contracts (for',
    'example: one contract dedicated for the',
    'sale, and another one to implement the',
    'ERC20 interface). Another common',
    'improvement for future sales was to',
    'transfer the funds to a dedicated',
    'contract (mostly a multi-signature',
    'wallet controlled by the team) as',
    'opposed to keeping the funds within the',
    'sale contract. As of January 2019,',
    'theDao contract had processed over',
    '173,000 transactions.'
  ]
},  
  {parkNumber: 10,  name: 'theDAO Fork',                                blockNumber: 1920000, hash: '4985f5ca3d2afbec36529aa96f74de3cc10a2a4a6c44f2157a57d2c6059a11bb',
  description: [
    'The recursive call bug allowed the',
    'attacker to drain theDAO to the tune of',
    '4 million Ether (or roughly $150M at',
    'the time). The community put forward',
    'the idea of refunding theDAO',
    'contributors via a hard fork — to the',
    'dismay of a minority within the',
    'community. From their point of view,',
    'Ethereum was initially sold as an',
    'immutable blockchain; forking to',
    'execute an irregular state change',
    'because of a badly written contract',
    'broke this property. However, there was',
    'a larger portion of the community which',
    'thought forking was justified and the',
    'correct course of action for the',
    'blockchain. Given the transition to',
    'proof-of-stake, leaving about 15% of',
    'the Ether supply in the hands of a',
    'malicious actor would put the network’s',
    'future at risk. There were also',
    'concerns that inaction from the',
    'community might lead to actions by',
    'regulatory agencies.',
    '',
    'In order to gather the community’s',
    'opinion, a dapp named CarbonVote was',
    'created to let people voice their',
    'stance on whether a hard fork should',
    'occur or not occur, whereby 1 ETH',
    'equated to 1 vote. The pro-fork vote',
    'tallied 3.96 million votes, while the',
    '“code is law” camp gathered 0.57',
    'million votes. In light of this vote,',
    'and of the general pro-fork stance by',
    'community members, the client teams',
    'implemented the hard fork changes and',
    'the network upgrade at block 1,920,000.',
    'A small community decided to not',
    'upgrade their nodes, to fork the code',
    'and to mine a new network called',
    'Ethereum Classic. Anyone with a balance',
    'on the Ethereum network would, at the',
    'fork block, automatically have their',
    'balance on the Ethereum Classic network',
    'too.',
    '',
    'The fork added a new block processing',
    'rule: at the fork block, all balances',
    'in theDAO and child DAOs would be',
    'zeroed out and refunds would be',
    'available to contributors in a newly',
    'written refund contract.'
  ]
}, 
  {parkNumber: 11,  name: 'EXTCODESIZE DoS Attack',                     blockNumber: 2283416, hash: '9852a25198a980b28999db234404a99ebf38bd9531b330bf6d7cf4cfe0f904ea',
  description: [
    'On September 18 2016, one day before',
    'the opening of Devcon2 and whilst many',
    'core developers were in the air on',
    'their way to Shanghai, the first',
    'Denial-of-service (DoS) attack on the',
    'Ethereum chain began. Many users began',
    'reporting that their geth node could',
    'not sync past block 2283415. A first',
    'security alert from Jeffrey Wilcke',
    'identified that a transaction at block',
    '2283416 was causing out-of-memory',
    'errors with geth. A second security',
    'alert four days later read as follows:',
    '',
    '“URGENT ALL MINERS: The network is',
    'under attack. The attack is a',
    'computational DDoS, ie. miners and',
    'nodes need to spend a very long time',
    'processing some blocks. This is due to',
    'the EXTCODESIZE opcode, which has a',
    'fairly low gasprice but which requires',
    'nodes to read state information from',
    'disk; the attack transactions are',
    'calling this opcode roughly 50,000',
    'times per block.”',
    '',
    'The account at',
    'EXTCODESIZEAttacker.',
    'aetheriablockmuseum.eth',
    'created a malicious contract (see',
    'EXTCODESIZEMaliciousContract.',
    'aetheriablockmuseum.eth)',
    'to repeatedly execute that poorly',
    'priced opcode. While the attack did not',
    'cause a consensus failure between',
    'clients, it did effectively halt all',
    'geth nodes for a long period of time.',
    'Luckily, the philosophy of “one',
    'specification/multiple client',
    'implementations” which differentiates',
    'Ethereum from its predecessor Bitcoin',
    'saved the day; the Parity client was',
    'not impacted by the DoS attack and',
    'effectively saved the network from',
    'grinding to a halt.'
  ]
},
  {parkNumber: 12,  name: 'DevCon-2: Shanghai',                         blockNumber: 2290000, hash: 'b7307cb2eb75e101c7fa95972c255d6e03520a5390365b22cb07a8c7a3b849a2',
  description: [
    'Devcon-2 launched on September 19 in',
    'China in the middle of a DoS attack.',
    'Settled soon after theDAO hard fork,',
    'Devcon-2 took exhausted development',
    'teams and placed them back in the',
    'spotlight. The network was under attack',
    '– the devs had to identify the issue,',
    'evaluate the different options and',
    'decide on the best course of action-',
    'all while seamlessly running their',
    'booth. Much of the 700 attendees’',
    'conversations at the time, which were',
    'previously optimistic and curious',
    'during Devcon-1, were shrouded in the',
    'dramas of the DAO fork, the split, and',
    'the DoS attack. However, attendants',
    'were met with the positivity of the',
    'Foundation which urged developers to',
    'engage in the tools and technologies of',
    'the early Ethereum platform - and',
    'ultimately, the show went on without a',
    'hitch.'
  ]
},    
  {parkNumber: 13,  name: '“Suicide Bomb” DoS Attack',                  blockNumber: 2421507, hash: 'c71986e9d7b7b17234ee8601009bdb7e3d2c1cbf0a24ce3d48375dba663c649f',
  description: [
    'While theDAO hack was probably mostly',
    'financially motivated, the EXTCODESIZE',
    'DoS attack had no obvious financial',
    'motives (apart from possibly gains from',
    'shorting ether, although this would not',
    'have paid off significantly since price',
    'only shortly dropped before rallying a',
    'few dollars above). So why would anyone',
    'spend time identifying and exploiting',
    'this vulnerability in geth?',
    '',
    'One of the narratives from Ethereum',
    'detractors around 2016 was that the',
    'Ethereum Virtual Machine was too',
    'flexible and powerful, and thus could',
    'not be properly secured.  A much',
    'stricter set of instructions, such as',
    'the Bitcoin scripting language, would',
    'actually be more useful to developers',
    'since they would not need to worry',
    'about a large attack surface. The',
    'motive for the DoS attack in September',
    '2016 could very well have been',
    'political; to prove that Ethereum was',
    'not as secure of a platform as some of',
    'its competitors. The same motive might',
    'explain the following DoS attack which',
    'took place less than a month later: the',
    'Suicide Bomb attacks (also sometimes',
    'referred as Empty Accounts attack).',
    '',
    'The attack again exploited another',
    'mispriced instruction, in this case,',
    'the cost of creating new accounts via a',
    'SUICIDE call. This was an oversight in',
    'the gas pricing design. In fact,',
    'creating a new account via a CALL',
    'instruction (the typical way) was',
    'properly priced at about 25,000 gas.',
    'But doing so via SUICIDE cost on',
    'average only about 95 gas.',
    '',
    'There were two attacker contracts',
    '(suicideBomber1.aetheriablockmuseum.eth',
    'and',
    'suicideBomber2.aetheriablockmuseum.eth)',
    'deployed at blocks 2,421,490 and',
    '2,423,558. The first symptoms were',
    'reported at block 2,421,507 when the',
    'first attacker contract published a',
    'single transaction which lead to 8561',
    'internal transactions. This single',
    'transaction only cost the attacker',
    '770,000 gas to create over 8000',
    'accounts. If the same price had been',
    'used as the one to create an account',
    'the typical way, fewer than 40 empty',
    'accounts would have been created in',
    'that transaction.  In other words, the',
    'attacker found a loophole in the',
    'pricing structure and abused it to',
    'disrupt the network to a maximum.',
    '',
    'The attackers used a very high gas',
    'price for the fee market of the time',
    '(20 gwei initially) to ensure their',
    '40,000+ transactions were prioritized',
    'and included by miners until the',
    'attackers stopped publishing',
    'transactions at block 2,463,130. They',
    'managed to create about 20M empty',
    'accounts which cluttered the state tree',
    'with around 30M (due to the',
    'construction of the tree). Since the',
    'state root is calculated from all nodes',
    'in the tree and since the state root is',
    'needed to mine and validate blocks,',
    'this attack had a seriously negative',
    'impact on the network. These empty',
    'accounts were later cleared from the',
    'state tree entirely and the number of',
    'accounts went down to around 770,000.',
    '',
    'At a price of about $12 per ether, the',
    'attackers must have spent less than',
    '$10,000 to cause significant damage to',
    'the Ethereum network, thus somewhat',
    'validating the claim from Ethereum',
    'detractors. However, since that event',
    'there has not been another DoS attack',
    'on Ethereum.'
  ]
},
  {parkNumber: 14,  name: 'Tangerine Whistle',                          blockNumber: 2463000, hash: '2086799aeebeae135c246c65021c82b4e15a2c451340993aacfd2751886514f0',
  description: [
    'The DoS attacks of Fall 2016 took a',
    'serious toll on the immediate network',
    'health of the Ethereum blockchain; with',
    'a large number of nodes not being able',
    'to sync, hard forks had to be quickly',
    'planned and implemented by client teams',
    'in order to restore operations. The',
    'first fork, named Tangerine Whistle,',
    'fixed several underpriced IO-heavy',
    'operations, as specified in EIP-150.',
    'This non-contentious fork occurred on',
    'October 18th 2016, approximately one',
    'month after the first DoS attack took',
    'place.'
  ]
}, 
  {parkNumber: 15,  name: 'Spurious Dragon',                            blockNumber: 2675000, hash: '58eff9265aedf8a54da8121de1324e1e0d9aac99f694d16c6a41afffe3817d73',
  description: [
    'On November 22nd, 2016, the Ethereum',
    'network underwent the “Spurious Dragon”',
    'hard fork at block 2,675,000. It was',
    'the second hard fork in response to the',
    'DoS attacks. In particular, the Suicide',
    'bomb attacks had created nearly',
    '20,000,000 empty accounts which',
    'cluttered the state trie (where',
    'information on account balances and',
    'storage is kept). The purpose of this',
    'second hard fork was to allow these',
    'empty accounts to be deleted and',
    'ignored by clients.',
    '',
    'Spurious Dragon implemented EIP-158. In',
    'particular, any account with nonce of',
    '0, balance of 0, no code or storage',
    'would be deleted whenever that account',
    'would be “touched” (such as when a',
    'no-value transaction would be sent to',
    'it). Over the course of the week',
    'following the fork, the 20 million',
    'empty accounts were all touched this',
    'way, which allowed the state trie to',
    'reduce significantly in size.',
    '',
    'On November 29th, 2016, Vitalik',
    'announced on Twitter “State clearing',
    '100% complete.”'
  ]
}, 
  {parkNumber: 16,  name: 'The Most Recent Pi Block',                   blockNumber: 3141592, hash: '68a31d86567fcb4807643375ea68ab4d281a570d42399505c8e0b49ee574363f',
  description: [
    'The last Pi block was mined on February',
    '7th 2017, with a total of 7 digits, it',
    'occurred almost 1.5 years after the',
    'previous Pi block of 6 digits',
    '(#314,159). Assuming an average block',
    'time of 10 seconds, the next Pi block',
    '(#31,415,926) should happen somewhere',
    'around 2026.'
  ]
},
  {parkNumber: 17,  name: 'Parity Multisig Public Init Hack',           blockNumber: 4041169, hash: '648276e5bffbeaaceae97b83954d7b79198032cce03dd538fe2f52b1da5f10c4',
  description: [
    'On July 18th 2017, at block 4,041,169,',
    'the account at',
    'multisigExploitHacker.',
    'aetheriablockmuseum.eth',
    'called the initWallet method of the',
    'Parity Multisign wallet of the Edgeless',
    'team (see edgelessMultisig.',
    'aetheriablockmuseum.eth).',
    'This method was meant to only be called',
    'at contract creation, but it was not',
    'annotated properly as such (say with an',
    'internal modifier). In fact, the',
    'default visibility was public, which',
    'meant that anyone was free to call the',
    'initWallet on *any* multisig wallets',
    'deployed after Version 1.5 of their',
    'wallet (approximately from December',
    '2016 through July 2017).',
    '',
    'One of the functions of the initWallet',
    'was to assign the owner of the wallet',
    'to the sender of the transaction (the',
    'hacker in this case). Ten blocks later,',
    'the wallet was emptied. Roughly 10',
    'hours later, at block 4,043,784, the',
    'hacker repeated the process on the',
    'Swarm City and Aethernity wallets,',
    'robbing these teams of about 153,000',
    'ether, which could have been used to',
    'further their development. There were',
    'plenty of vulnerable wallets which were',
    'not drained by the hacker. The nature',
    'of the bug was kept as secret as',
    'possible while the White Hat Group (the',
    'same group that stepped in during',
    'theDAO to rescue funds) drained the',
    'vulnerable wallets of all ether and',
    'ERC-20 to a safe location. These funds,',
    'around 377,000 ether, were later',
    'distributed to the rightful owners by',
    'the White Hat Group.',
    '',
    'A stronger smart contract audit process',
    'may have avoided this issue. Similarly,',
    'it might have been safer to design',
    'Solidity so that the default visibility',
    'of methods isn’t public (or that it',
    'must be explicitly specified in all',
    'cases). In the end, it was also the',
    'community and the users’ fault for not',
    'catching such a simple (and in',
    'hindsight extremely obvious) flaw.',

    '',
    'The last transfer out of that account',
    'happened one day after the heist took',
    'place and, as of early 2019, there is',
    'still a balance of roughly 83,000 ETH',
    'in the hacker’s account.'
  ]
},
  {parkNumber: 18,  name: 'Decentraland MANA sale startBlock',          blockNumber: 4170700, hash: '6de40774564a3678218acc0f606c1e35464d632830db5c10e51e61f36e1326d3',
  description: [
    'Decentraland, the Virtual Reality (VR)',
    'world that you are currently visiting,',
    'had a first working version called the',
    'Bronze Age. From the whitepaper:',
    '',
    '“In late 2016, the team started',
    'developing the Bronze Age, a 3D virtual',
    'world divided into land parcels. The',
    'owner of each parcel was able to',
    'associate it with a hash reference to a',
    'file, using a modified Bitcoin',
    'blockchain. From this reference, users',
    'exploring the virtual world could use a',
    'Distributed Hash Table (DHT) and',
    'BitTorrent to download the file',
    'containing the parcel’s content, which',
    'defines the models and textures to be',
    'displayed at that location.”',
    '',
    'In other words, it was now possible to',
    '“own” VR land and be in control of',
    'what’s displayed on it without the need',
    'for a 3rd party organization. The team',
    'realized that the Ethereum blockchain',
    'was a better fit for ownership tracking',
    'since it was easier to program than',
    'Bitcoin; as well as enabling more',
    'flexible control mechanisms such as',
    'maintaining operators who can control',
    'what occurs on the VR land without',
    'being able to transfer or sell the',
    'land. Another advantage of building on',
    'Ethereum was the possibility of',
    'engaging a community and raising funds',
    'by running a token sale. A local',
    'currency would be used within',
    'Decentraland, the MANA token. This',
    'in-game currency would also be used to',
    'place bids on LAND parcels in an',
    'upcoming VR land sale.',
    '',
    'The MANA sale (contract at',
    'MANATokensale.aetheriablockmuseum.eth)',
    'took place in the middle of the 2017',
    'ICO frenzy. It was meant to occur',
    'between blocks 4,170,700 and 4,202,097',
    'but mostly sold out in 3 blocks. By',
    'block 4,170,702, the majority of the',
    'available MANA had been purchased and',
    'only dust was left to claim. The sale',
    'ended at block 4,170,967 when the',
    'entire supply had been purchased. Like',
    'other popular token sales around that',
    'time, many community members were not',
    'able to participate in the sale. Their',
    'only option left if they wanted to',
    'participate in the land auction, called',
    'the Terraform, was to purchase MANA on',
    'a secondary market where the price was',
    'higher than during the initial sale.'
  ]
},
  {parkNumber: 19,  name: 'The Terraform Event',                        blockNumber: 4321454, hash: '0a989ad83a89295795f9cc128dd00be1e6b430a86137cce4bbf66c3f015fb0b7',
  description: [
    'Then came the Terraform, the initial',
    'generation of LAND within Decentraland',
    'in September 2017. It was handled by',
    'terraform.aetheriablockmuseum.eth,',
    'created at block 4,321,454. Initially',
    'the cutoff date was December 15, 2018',
    'but in the end people were able to lock',
    'more MANA into the Terraform contract',
    'while the auction was live, thus',
    'creating 70,399 parcels of LAND. A',
    'whopping 161,483,050 MANA (roughly',
    '$10m) was spent in what became the',
    'largest ever virtual land sale.'
  ]
},    
  {parkNumber: 20,  name: 'Metropolis Byzantium',                       blockNumber: 4370000, hash: 'b1fcff633029ee18ab6482b58ff8b6e95dd7c82a954c852157152a7a6d32785e',
  description: [
    'On October 16, 2017, Metropolis - an',
    'Ethereum development roadmap - began',
    'the first of its two stages with the',
    'Byzantium fork. Activated at block',
    '4,370,000, Byzantium ushered in major',
    'improvements to the Ethereum blockchain',
    'including the introduction of',
    'STATICCALL (EIP-214); a “status” field',
    'in transaction receipts for easy',
    'verification by light clients (EIP-658)',
    'and a fix to the uncle rewards',
    '(EIP-100). Other significant changes',
    'with Byzantium are the addition of new',
    'opcodes and precompiled contracts to',
    'make it easier for developers to',
    'experiment with zkSNARKs (zkSNARKs',
    'enable clients to provide proof to a',
    'verifier that they possess a secret',
    'without revealing said secret to the',
    'verifier).',
    '',
    'Additionally, Byzantium diffused the',
    'difficulty timebomb for a first time,',
    'marking the end of the first Ethereum',
    'Ice Age. The second Ice Age would last',
    'until the Metropolis Constantinople',
    'fork, nearly 1.5 years later.'
  ]
}, 
  {parkNumber: 21,  name: 'DevCon-3: Cancun',                           blockNumber: 4470000, hash: 'dcbe9efcdb05574f8f10323c794e2246add50a99445951695e3da78f4cb71ce7',
  description: [
    'Soon after the Byzantium fork, Devcon-3',
    'launched in November 1-4 2017, in sunny',
    'Cancun. Growth of the convention had',
    'previously exceeded capacities, so it',
    'was the first time the conference',
    'expanded into multiple rooms, thereby',
    'enabling 40% more sessions, a press',
    'room with a live feed, meeting rooms,',
    'booths, and “the works.” The whopping',
    '2,000 attendees were provided',
    'segregated bandwidth for livestreaming',
    'at the event and they shared photos and',
    'stories of their meetups as well as',
    'excursions amidst the waters of the',
    'Caribbean outside of the venue. While',
    'livestreaming was highly encouraged,',
    'Ming Chan - Devcon MC - noted that the',
    'energy at Devcon-3 was not tangible',
    'unless physically present. Overall, the',
    'convention was finally gaining',
    'notoriety as something of a “Comicon”',
    'for the world of crypto.'
  ]
},
  {parkNumber: 22,  name: 'Parity Multisig Library Suicide',            blockNumber: 4501969, hash: '894f3aac1c8a0c9b05d2cbe6c0c9af907ca44a1c96aeda69a0ec064b9a74b790',
  description: [
    'One would have hoped that the July 2017',
    'multisig incident would have',
    'significantly increased the security of',
    'Parity Multisig wallets. A following',
    'version of their multsig wallets moved',
    'to having a shared library deployed on',
    'the blockchain. The goal was to reduce',
    'the cost of deploying new multisig',
    'wallets since reusable code (say,',
    'transfer of funds, or *code for wallet',
    'initialization*) did not have to be',
    'included in the blockchain for each',
    'wallet. In fact, that code was code',
    'reviewed and audit occurred; albeit in',
    'the middle of a large commit which also',
    'included front-end changes; however the',
    'issue was not so much in the code',
    'itself, as the deployment steps: no one',
    'from Parity ever called initWallet on',
    'the library contract itself.',
    '',
    'On November 6th 2017, A github user',
    'named devops199 did just that at block',
    '4,501,736 (see',
    'devops199.aetheriablockmuseum.eth).',
    'Their motive will never be truly',
    'understood. They claimed it was a',
    'mistake with their now infamous “I',
    'accidentally killed it”, but given that',
    'they chose to explicitly call the',
    'suicide method at block 4,501,969',
    'indicated that they had a significant',
    'understanding of what they were doing.',
    'Approximately $280M at the time (about',
    '1% of all ether in circulation)',
    'effectively became stuck and',
    'untransferable after the suicide call.',
    'Since the individual wallets depended',
    'on shared library code which didn’t',
    'exist anymore, there was nothing to be',
    'done.',
    '',
    'This one transaction has had, arguably,',
    'the second most negative impact on the',
    'Ethereum ecosystem (after theDAO',
    'transactions which lead to a hard-fork',
    'and community split). There were',
    'efforts from some in the community to',
    'push for changes that would allow',
    'recovery of “provably lost/stuck funds”',
    'which could possibly have helped',
    'victims of other such accidents. The',
    'general idea being that if a private',
    'key is stolen and a thief can transfer',
    'the funds out, it’s impossible for the',
    'owner to prove that they are not, in',
    'fact, the thief. However, in the case',
    'of “provably lost” funds, it is',
    'possible for the owners to prove that',
    'they indeed own the funds, but simply',
    'cannot access them. However, there was',
    'not enough traction in the community',
    'for this change to be accepted; so to',
    'this day the funds are still visible on',
    'the blockchain, but simply cannot be',
    'transferred. Ironically, one of the',
    'main victims of this hack was the',
    'Polkadot multisig wallet owned by the',
    'Web3 Foundation, which had also',
    'contracted Parity to build Polkadot.',
    'Effectively, the lack of an established',
    'deployment process at Parity caused one',
    'of their key clients to incur a',
    'significant loss. After that incident,',
    'Parity stopped offering multisig wallet',
    'code templates to their client users.'
  ]
},
  {parkNumber: 23,  name: 'CryptoKitty #1 is born',                     blockNumber: 4605346, hash: '62b5de48e43c2ff66623d272f9dd1db879870f9d78c840b450501b9e4fbe93ab',
  description: [
    'The launch of CryptoKitties - a game',
    'where you breed and collect digital',
    'cats that live on the blockchain - led',
    'the way for the future of complex',
    'non-fungible tokens (NFTs). The token',
    'contract, at',
    'cryptokitties.aetheriablockmuseum.eth,',
    'was deployed on block 4,605,167,',
    'however, Kitty #1 was actually minted',
    '179 blocks later at block 4,605,346.',
    'While CryptoKitties was not the first',
    'NFT to be deployed on the blockchain,',
    'it quickly became the most popular',
    'application by far. Eventually it',
    'clogged the Ethereum network, with',
    'infrastructure such as Infura.io',
    'struggling to keep up with Ethereum',
    'transactions. CryptoKitties remains one',
    'of the most popular NFTs to date, with',
    'over 3.5 million transactions as of',
    'quarter one 2019 and several hundred',
    'on-chain users each day.',
  ]
},
  {parkNumber: 24,  name: 'The Birth of the DAI',                       blockNumber: 4752008, hash: '1ccb5da1337a99a6f864046dbbc79ba3be50ff6122811eb3989f6a470d2492f1',
  description: [
    'The Maker DAI system is the first',
    'decentralized stablecoin system to be',
    'released on the Ethereum chain. It',
    'seeks to peg the DAI token to 1 USD by',
    'the elegant use of economic incentives.',
    'A user deposits collateral (only ether',
    'for now, multi-collateral is on the',
    'roadmap) to the Maker DAI contract. By',
    'doing so, they are allowed to mint',
    'brand-new DAI and use it as wished',
    '(leverage eth purchase, refinancing of',
    'other debts, loan DAI on DeFI',
    'applications).',
    '',
    'As long as the collateral-to-debt ratio',
    'stays healthy, such as when the value',
    'of the collateral increase, the system',
    'is safe since the collateral (owned by',
    'the smart contract at that point) could',
    'in theory be sold to reimburse the',
    'debt. If the collateral decreases in',
    'price (such as during the great bear',
    'market of 2018), the debt owner must',
    'either add collateral to their debt',
    'position (by depositing more eth for',
    'instance), or reimburse the DAI that',
    'was loaned (which is only possible if',
    'they have not spent the DAI). Failure',
    'to do so put them at risk of',
    'liquidation when the collateral-to-debt',
    'ratio falls below a certain parameter',
    'of the system (150% for now). When a',
    'debt position is below that level,',
    'anyone can purchase the debt at the',
    'given price and earn the liquidation',
    'penalty fee paid by the debt owner (who',
    'gets to keep the DAI loaned, but loses',
    'the collateral). This mechanism ensures',
    'that the system is properly',
    'collateralized at all time.',
    '',
    'The system is composed of multiple',
    'contracts which were deployed on',
    'December 17 and December 18th of 2017',
    'after years of development and multiple',
    'rounds of audits. The actual DAI token',
    'contract (dai.aetheriablockmuseum.eth)',
    'itself was deployed at block 4752008.'
  ]
},
  {parkNumber: 25,  name: 'DevCon-4: Prague',                           blockNumber: 6610000, hash: '1d47e931fc01f54f1119f5efd98ab4fd0e07ed6358da0d15de30611a7ecede69',
  description: [
    'Between October 30th and November 2nd,',
    '2018, Devcon-4 took place in Prague.',
    'With 3,000 attendees, Devcon-4 was the',
    'largest crypto convention to date.',
    'Major topics involved: scalability,',
    'security, privacy, developer',
    'experience, society and design. Updates',
    'were included from:  from the Swarm',
    'team, the STARKs workshop, optimization',
    'of smart contracts, the Raiden Network',
    'and the state of Plasma. Perhaps the',
    'most vital convention yet, Devcon-4',
    'focused on scaling the platform so that',
    'it would be ready for mainstream',
    'adoption.'
  ]
},
]

// maps two hexa digits to one of these options:
// 20, 40, 60, 80, a0, c0, e0
const normalizeSubcolor = function(twoHexDigits) {
  twoHexDigits = twoHexDigits.toUpperCase()
  let firstDigit = twoHexDigits[0]
  switch(firstDigit) {
    case '0':
    case '1':
    case '2':
      return '20'
      break;
    case '3':
    case '4':
      return '40'
      break;        
    case '5':        
    case '6': 
      return '60'
      break;                
    case '7':                
    case '8':            
      return '80'
      break;                
    case '9':                
    case 'A':            
      return 'A0'
      break;                    
    case 'B':            
    case 'C':            
      return 'C0'
      break;                        
    case 'D':            
    case 'E':            
    case 'F':  
      return 'E0'
      break;                                  
  }
}

const buildColor = function(parkNumber, variationNumber) {
  let hash = sourceParkDataArr[parkNumber - 1].hash

  let start = (variationNumber - 1) * 6  // each variation takes 6 hex digits from hash
  let red = hash.substring(start, start + 2)
  let green = hash.substring(start + 2, start + 4)
  let blue = hash.substring(start + 4, start + 6)
  let normalizedRed = normalizeSubcolor(red)
  let normalizedGreen = normalizeSubcolor(green)
  let normalizedBlue = normalizeSubcolor(blue)  

  let normalizedColor = '#' + normalizedRed + normalizedGreen + normalizedBlue
  return normalizedColor
}

const pathColor1 = function(parkNumber) {
  return buildColor(parkNumber, 1)
}
const pathColor2 = function(parkNumber) {
  return buildColor(parkNumber, 2)
}
const pathColor3 = function(parkNumber) {
  return buildColor(parkNumber, 3)
}
const pathColor4 = function(parkNumber) {
  return buildColor(parkNumber, 4)
}
const benchColor1 = function(parkNumber) {
  return buildColor(parkNumber, 5)
}
const benchColor2 = function(parkNumber) {
  return buildColor(parkNumber, 6)
}
const benchColor3 = function(parkNumber) {
  return buildColor(parkNumber, 7)
}
const benchColor4 = function(parkNumber) {
  return buildColor(parkNumber, 8)
}

const templateVars = function(conceptNumber, parkNumber) {

  let pathHeight = 0.05
  let grassHeight = 0.05
  
  let vars = {
    conceptNumber: conceptNumber,
    parkNumber: parkNumber,
    benchLength: 4,
    legHeight: 0.6,
    legWidth: 0.05,
    sittingWidth: 1,
    sittingHeight: 0.1,
    backWidth: 0.1,
    backHeight: 0.6,
    pathHeight: pathHeight,
    grassHeight: grassHeight,
    paths: [
      {width: 2, height: pathHeight, length: 16, x: 3,  y: pathHeight / 2.0, z: 8,  angle: 0,   color: pathColor1(parkNumber)},      // westPath

      {width: 2, height: pathHeight, length: 2, x: 1,  y: pathHeight / 2.0, z: 13, angle: 90,  color: pathColor2(parkNumber)},        // northPath 1
      {width: 2, height: pathHeight, length: 12, x: 10,  y: pathHeight / 2.0, z: 13, angle: 90,  color: pathColor2(parkNumber)},      // northPath 2

      {width: 2, height: pathHeight, length: 2, x: 13, y: pathHeight / 2.0, z: 15,  angle: 180, color: pathColor3(parkNumber)},      // eastPath 1
      {width: 2, height: pathHeight, length: 12, x: 13, y: pathHeight / 2.0, z: 6,  angle: 180, color: pathColor3(parkNumber)},      // eastPath 2

      {width: 2, height: pathHeight, length: 2, x: 15,  y: pathHeight / 2.0, z: 3,  angle: 270, color: pathColor4(parkNumber)},       // southPath 1
      {width: 2, height: pathHeight, length: 8, x: 8,  y: pathHeight / 2.0, z: 3,  angle: 270, color: pathColor4(parkNumber)},        // southPath 2
      {width: 2, height: pathHeight, length: 2, x: 1,  y: pathHeight / 2.0, z: 3,  angle: 270, color: pathColor4(parkNumber)}         // southPath 3
    ],
    benches: [
      {x: 1,  y: 0, z: 8,  angle: 0,   color: benchColor1(parkNumber)},       // westBench  
      {x: 8,  y: 0, z: 15, angle: 90,  color: benchColor2(parkNumber)},       // northBench
      {x: 15, y: 0, z: 8,  angle: 180, color: benchColor3(parkNumber)},       // eastBench
      {x: 8,  y: 0, z: 1,  angle: 270, color: benchColor4(parkNumber)}        // southBench
    ],
    trees: [
      {x: 1,  y: 0.5, z: 1},    // swTree
      {x: 5,  y: 0.5, z: 1},    // swnTree
      {x: 1,  y: 0.5, z: 5},    // sweTree
      {x: 1,  y: 0.5, z: 15},   // nwTree
      {x: 1,  y: 0.5, z: 11},   // nwsTree
      {x: 5,  y: 0.5, z: 15},   // nweTree
      {x: 15, y: 0.5, z: 15},   // neTree
      {x: 11, y: 0.5, z: 15},   // newTree
      {x: 15, y: 0.5, z: 11},   // nesTree
      {x: 15, y: 0.5, z: 1},    // seTree
      {x: 15, y: 0.5, z: 5},    // senTree
      {x: 11, y: 0.5, z: 1},    // sewTree
    ],
    grassyAreas: [
      {width: 2, height: grassHeight, length: 2, x: 1, y: grassHeight / 2.0, z: 1 },     // southwest
      {width: 2, height: grassHeight, length: 8, x: 1, y: grassHeight / 2.0, z: 8 },     // west
      {width: 2, height: grassHeight, length: 2, x: 1, y: grassHeight / 2.0, z: 15 },    // northwest
      {width: 8, height: grassHeight, length: 2, x: 8, y: grassHeight / 2.0, z: 15 },    // north      
      {width: 2, height: grassHeight, length: 2, x: 15, y: grassHeight / 2.0, z: 15 },   // northeast
      {width: 2, height: grassHeight, length: 8, x: 15, y: grassHeight / 2.0, z: 8 },    // east      
      {width: 2, height: grassHeight, length: 2, x: 15, y: grassHeight / 2.0, z: 1 },    // southeast
      {width: 8, height: grassHeight, length: 2, x: 8, y: grassHeight / 2.0, z: 1 }      // south
    ],
    parkData: sourceParkDataArr[(parkNumber - 1) % sourceParkDataArr.length]
  }

  return vars
}

const generatePark = function(conceptNumber, parkNumber, outputFolder) {

  const sourceFolder = 'templates'

  // validate conceptNumber
  let cnumber = Number(conceptNumber)
  if(isNaN(cnumber) || !Number.isInteger(cnumber) || cnumber <= 0 || cnumber > 512) {
    logError('Concept number is invalid (must be an integer between 1 and 512)')
    process.exit(1)
  }

  // validate parkNumber
  let number = Number(parkNumber)
  if(isNaN(number) || !Number.isInteger(number) || number <= 0 || number > 512) {
    logError('Park number is invalid (must be an integer between 1 and 512)')
    process.exit(1)
  }

  // validate outputFolder
  if(fs.existsSync(outputFolder)) {
    logError('Output folder ' + outputFolder + ' already exists')
    process.exit(1)
  }

  // create output folder
  try {
    fs.mkdirSync(outputFolder)
  } catch(err) {
    logError('Could not create output folder:\n' + err)
    process.exit(1)
  }
  logSuccess('Ouput folder created')

  // check DCL installed - maybe we can later also check the version output (currently using 3.2.1) or add to npm dependencies
  // let spawnResultCheck = childProcess.spawnSync('dcl', ['version'])
  // if(spawnResultCheck.error) {
  //   logError('Error executing dcl:\n', spawnResultCheck.error)
  //   process.exit(1)
  // }

  // init the park using DCL CLI
  let spawnResultInit = childProcess.spawnSync('dcl', ['init'], {cwd: outputFolder})
  if(spawnResultInit.error) {
    logError('Error executing dcl init:\n' + spawnResultInit.error)
    process.exit(1)
  }  
  fs.unlinkSync(path.join(__dirname, outputFolder, 'src', 'game.ts')) // delete the src/game.ts file generated by DCL (we'll replace it later)

  // temporary: force decentraland ECS version 6.4.0 (6.4.1 breaks colors - at least in our local dev environment)
  let spawnResultEcsDowngrade = childProcess.spawnSync('npm', ['install', 'decentraland-ecs@6.4.0'], {cwd: outputFolder})
  if(spawnResultEcsDowngrade.error) {
    logError('Error executing npm install decentraland-ecs@6.4.0 (downgrade):\n' + spawnResultEcsDowngrade.error)
    process.exit(1)
  }  

  logSuccess('Ouput folder initialized')

  // copy all non-ejs files in /templates over to output folder
  const filterFunc = (source, destination) => {
    let extension = source.split('.').pop()
    if(extension === 'ejs') {
      return false
    }
    return true
  }  
  try {
    fse.copySync(path.join(__dirname, sourceFolder), path.join(__dirname, outputFolder), { filter: filterFunc })
    logSuccess('Templates applied')
    logSuccess(`To preview your new scene, cd ${outputFolder} && dcl start`)    
  } catch(err) {
    logError('Error copying templates:\n' + err)    
    process.exit(1)
  }

  // generate game.ts using ejs templating
  let vars = templateVars(conceptNumber, parkNumber)
  ejs.renderFile(path.join(__dirname, sourceFolder, 'src', 'game.ts.ejs'), vars, (err, output) => {
    if(err) {
      logError('Error applying ejs template:\n' + err)
      process.exit(1)
    } else {
      fse.writeFileSync(path.join(__dirname, outputFolder, 'src', 'game.ts'), output)
      logSuccess('Game.ts generated')
      process.exit(0)
    }
  })
}

switch(args[2]) {
  case 'new':
    if(args.length !== 5 || !args[4]) {
      logError('Invalid arguments')
      showHelp()
      process.exit(1)
    } else {
      let outputFolder = `concept-${args[3]}-park-${args[4]}`
      generatePark(args[3], args[4], outputFolder)
      process.exit(0)
    }
    break

  case 'help':
    showHelp()
    process.exit(0)
    break    

  default:
    logError('Invalid arguments')
    showHelp()
    process.exit(1)
}