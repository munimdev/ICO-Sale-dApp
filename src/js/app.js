App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 4000000,
    tokensSold: 0,
    tokensAvailable: 23000000000000000000000000,
    init: function() {
        console.log("App initialised")
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContracts();
    },

    initContracts: function() {
        $.getJSON("wUTILTokenSale.json", function(uwtilTokenSale) {
            App.contracts.wUTILTokenSale = TruffleContract(uwtilTokenSale);
            App.contracts.wUTILTokenSale.setProvider(App.web3Provider);
            App.contracts.wUTILTokenSale.deployed().then(function(uwtilTokenSale) {
                console.log("wUTIL Token Sale Address:", uwtilTokenSale.address);
            });
        }).done(function() {
            $.getJSON("wUTILToken.json", function(uwtilToken) {
                App.contracts.wUTILToken = TruffleContract(uwtilToken);
                App.contracts.wUTILToken.setProvider(App.web3Provider);
                App.contracts.wUTILToken.deployed().then(function(uwtilToken) {
                    console.log("wUTIL Token Address:", uwtilToken.address);
                });
                App.listenForEvents();
                return App.render();
            });
        })
    },

    getPrice: function getLatestPrice() {

    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        App.contracts.wUTILTokenSale.deployed().then(function(instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event) {
                console.log("event triggered", event);
                App.render();
            })
        })
    },

    render: function() {
        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        // loader.show();
        // content.hide();

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                console.log("account", account);
                App.account = account;
                $('#accountAddress').html("Your Connected Wallet: " + account);
            }
        })

        // Load token sale contract
        App.contracts.wUTILTokenSale.deployed().then(function(instance) {
            wUTILTokenSaleInstance = instance;
            return wUTILTokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            App.tokenPrice = tokenPrice;
            wUTILTokenSaleInstance.getPrice().then(function(result) {
                var maticusd = result.c[0]
                $('#token-price').html(parseFloat(App.tokenPrice.c[0] / maticusd).toFixed(5));
            });
            return wUTILTokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold / 10 ** 18);
            $('.tokens-available').html(Math.round(App.tokensAvailable / 10 ** 18));

            var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            // Load token contract
            App.contracts.wUTILToken.deployed().then(function(instance) {
                wUTILTokenInstance = instance;
                return wUTILTokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.dapp-balance').html(web3.fromWei(balance, "ether").toNumber());
                App.loading = false;
                loader.hide();
                content.show();
            })
        });
    },

    buyTokens: function() {
        // $('#content').hide();
        // $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.wUTILTokenSale.deployed().then(function(instance) {
            instance.getPrice().then(function(result) {
                var maticusd = result.c[0]; //gets price of matic in usd with 8 decimals (using aggregator v3 interface)
                return instance.buyTokens(numberOfTokens, {
                    from: App.account,
                    value: Math.round(numberOfTokens / ((maticusd / App.tokenPrice.c[0]))), //value in wei (i.e. 18 decimals)
                    gas: 500000 // Gas limit
                });
            });
        }).then(function(result) {
            console.log("Tokens bought...")
            $('form').trigger('reset') // reset number of tokens in form
                //wait for sell event
                // $('#loader').hide()
                // $('#content').show();
        });
        //$('#content').show();
    }
}

$(function() {
    $(window).load(function() {
        App.init();
    })
})