import Helpers from './_helpers';
import https from 'https';

export default class Cryptostats
{

    constructor()
    {
        this.wallet = {
            'btc': {
                'addresses': [
                    '1rahL1FtAfausqm54HRPGkRPq6sGs8EJ8',
                    '15QYFNJDd9yiPJc2GummCWNfqHmMERQNLP',
                    '1F7jtuVjirsS8DxVjxxQ2p3FfLGAFyEgx4'
                ]
            },
            'eth': {
                'addresses': [
                   '0xedaa09e2998e642da30e98b7693953b655ff5b9e'
                ]
            },
            'ltc': {
                'addresses': [
                    'LSM2FbpWFYrQ3P6RDyLFBjz7s4mMT3GPfU',
                    'LcUwEFkGNiWNJfkqpygUEN8VL4zVVeEQwP',
                    'LQGj4sbh372GfMZ1SK47tzsQW3354oK4cr'
                ]
            },
            'dash': {
                'addresses': [
                    'XbYCKYwXnVFxFUL6duqPPWw26aAoj5vs78',
                    'XrYJyZMFkJu1EHNgY5f5tTgwWZ3HKkYb5r'
                ]
            }
        };
    }

    init()
    {
        this.load().then((result) =>
        {
            console.log('async method done');
        });
    }

    async load()
    {        
        // loop through all coins
        for(const [coin, data] of Object.entries(this.wallet))
        {
            // loop through all addresses
            for(let address of data.addresses)
            {
                let balance = await this.getBalance(coin, address).catch(error => console.log(error));
                this.setBalance(coin, address, balance.final_balance);          
            }
            // coin is finished: get market cap (don't await)
            let marketcap = this.getMarketCap(coin).catch(error => console.log(error)).then((v) => 
            {
                console.log(v);
                // TODO: take the values in the wallet, apply them to the market cap and print out a shiny diagram
            });
        }
        // all finished
        console.log(this.wallet);
    }

    setBalance(coin, address, value)
    {
        if( this.wallet[coin].balances === undefined )
        {
            this.wallet[coin].balances = {};
        }
        this.wallet[coin].balances[address] = value;
    }

    getBalance(coin, address)
    {
        return Helpers.getWithPromise(
            'https://api.blockcypher.com/v1/'+coin+'/main/addrs/'+address+'/balance',
            1000
        );
    }

    getMarketCap(coin, days = 60)
    {
        return Helpers.getWithPromise(
            'https://min-api.cryptocompare.com/data/histoday?fsym='+coin.toUpperCase()+'&tsym=EUR&limit='+days,
            1000
        );
    }
    
}