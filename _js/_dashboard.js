export default class Dashboard
{

    constructor()
    {
        this.keys = {
            'btc': [
                '0xedaa09e2998e642da30e98b7693953b655ff5b9e'
            ],
            'eth': [
                '1rahL1FtAfausqm54HRPGkRPq6sGs8EJ8',
                '15QYFNJDd9yiPJc2GummCWNfqHmMERQNLP',
                '1F7jtuVjirsS8DxVjxxQ2p3FfLGAFyEgx4'
            ],
            'ltc': [
                'LSM2FbpWFYrQ3P6RDyLFBjz7s4mMT3GPfU',
                'LcUwEFkGNiWNJfkqpygUEN8VL4zVVeEQwP',
                'LQGj4sbh372GfMZ1SK47tzsQW3354oK4cr'
            ]
        }
    }

    static init()
    {        
        document.querySelector('.balance--overall').textContent = this.getBalance();
        document.querySelector('.balance--eth').textContent = this.getBalanceEthereum();
        document.querySelector('.balance--btc').textContent = this.getBalanceBitcoin();
        document.querySelector('.balance--ltc').textContent = this.getBalanceLitecoin();
    }

    static getBalance()
    {
        return this.getBalanceEthereum() + this.getBalanceBitcoin() + this.getBalanceLitecoin();
    }

    static getBalanceEthereum()
    {
        return 1337;
    }

    static getBalanceBitcoin()
    {
        return 1338;
    }

    static getBalanceLitecoin()
    {
        return 1339;
    }
    
}