# ERC20 ICO Sale dApp

<ol>
<li>Make sure to open the code.secret file in any text editor and enter your 12 word secret key phease in it (obtain it from Metamask</li>

<li>Use npm install to install all the project dependencies. Truffle, node, lite-server, web3.js were used.</li>

<li>Open the terminal in this directory and run the following command to deploy the smart contracts to the Mumbai Polygon Testnet:
```
   'truffle migrate --reset compile --all --network matictestnet'
```

If it does not deploy to the testnet, simply run the command again.</li>

<li>Open another terminal and type "npm run dev" to run a server on your machine using lite-server.

Go to localhost:3000 to view the webpage.</li>

<li>In order to deploy to the Polygon Mainnet, run the following commands in order:
```
   'truffle compile'
   'truffle deploy --network maticmainnet'
```
</li>
<ol>