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
        /*
        document.querySelector('.balance--overall').textContent = this.getBalance();
        document.querySelector('.balance--eth').textContent = this.getBalanceEthereum();
        document.querySelector('.balance--btc').textContent = this.getBalanceBitcoin();
        document.querySelector('.balance--ltc').textContent = this.getBalanceLitecoin();
        */


    }

    getBalances()
    {
        this.getNextBalance();
    }

    getNextBalance()
    {
        for(const [coin, data] of Object.entries(this.wallet))
        {
            let address = this.getNextUnfinishedAddress(data);

            if( address === null )
            {
                continue;
            }

            this.getBalance(coin, address)
                .then((result) => 
                {
                    if( this.wallet[coin].balances === undefined )
                    {
                        this.wallet[coin].balances = {};
                    }
                    this.wallet[coin].balances[address] = result.final_balance;
                    // throttle
                    setTimeout(() =>
                    {
                        this.getNextBalance();
                    },1000);
                })
                .catch((error) =>
                {
                    console.log('error');
                    console.log(error);
                });

            return;
        }

        // all done
        console.log(this.wallet);
    }

    getNextUnfinishedAddress(data)
    {
        if( data.balances === undefined )
        {
            return data.addresses[0];
        }
        if( Object.keys(data.balances).length >= data.addresses.length )
        {
            return null;
        }
        return data.addresses[Object.keys(data.balances).length];
    }

    getBalance(coin, address)
    {
        return Helpers.get('https://api.blockcypher.com/v1/'+coin+'/main/addrs/'+address+'/balance');
    }

    getMarketCap(coin, days = 60)
    {
        return Helpers.get('https://min-api.cryptocompare.com/data/histoday?fsym='+coin.toUpperCase()+'&tsym=EUR&limit='+days);
    }
    
}