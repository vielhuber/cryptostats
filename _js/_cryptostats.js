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
                let balance = 0;
                let api = await this.getBalance(coin, address).catch((error) => {});
                if( api && api.final_balance )
                {
                    balance = api.final_balance;
                }
                this.setBalance(coin, address, balance);          
            }

            // balances of coin is finished: get market cap of this coin (don't await)
            let marketcap = this.getMarketCap(coin).catch(error => console.log(error)).then((data) => 
            {
                this.drawChart(coin, data.Data);
            });
        }
        // all finished
        console.log(this.wallet);
    }

    drawChart(coin, data)
    {
        if( this.wallet[coin].chart === undefined )
        {
            this.wallet[coin].chart = [];
        }
        for(let data__value of data)
        {
            this.wallet[coin].chart.push({
                t: new Date(data__value.time * 1000),
                y: this.calcFinalValue(coin, data__value.close)
            });
        }
    }

    calcFinalValue(coin, value)
    {
        let result = 0;
        for(const [balance__key, balance__value] of Object.entries(this.wallet[coin].balances)) {
            result += balance__value;
        }
        // scale
        if( coin === 'btc' || coin === 'ltc' || coin === 'dash' )
        {
            // 100000000 satoshi => 1 bitcoin
            result *= 0.00000001;
        }
        if( coin === 'eth' )
        {
            // 1000000000000000000 wei => 1 ether
            result *= 0.000000000000000001;
        }
        result *= value;
        result = (Math.round(result*100)/100);
        return result;
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
            500
        );
    }

    getMarketCap(coin, days = 60)
    {
        return Helpers.getWithPromise(
            'https://min-api.cryptocompare.com/data/histoday?fsym='+coin.toUpperCase()+'&tsym=EUR&limit='+days,
            500
        );
    }
    
}