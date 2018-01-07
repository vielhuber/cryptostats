import Helpers from './_helpers';
import https from 'https';
import Chart from 'chart.js';

export default class Cryptostats
{

    constructor()
    {
        this.chart = null;
        this.wallet = {
            'btc': {
                'addresses': [
                    '1rahL1FtAfausqm54HRPGkRPq6sGs8EJ8',
                    '15QYFNJDd9yiPJc2GummCWNfqHmMERQNLP',
                    '1F7jtuVjirsS8DxVjxxQ2p3FfLGAFyEgx4',
                    '16MakCZzW615uUC1TtErE9oms3Z7LMdc7d'
                ],
                'color': '#EB6534'
            },
            'eth': {
                'addresses': [
                   '0xedaa09e2998e642da30e98b7693953b655ff5b9e'
                ],
                'color': '#ACBEA3'
            },
            'ltc': {
                'addresses': [
                    'LSM2FbpWFYrQ3P6RDyLFBjz7s4mMT3GPfU',
                    'LcUwEFkGNiWNJfkqpygUEN8VL4zVVeEQwP',
                    'LQGj4sbh372GfMZ1SK47tzsQW3354oK4cr'
                ],
                'color': '#AD5D4E'
            },
            'dash': {
                'addresses': [
                    'XbYCKYwXnVFxFUL6duqPPWw26aAoj5vs78',
                    'XrYJyZMFkJu1EHNgY5f5tTgwWZ3HKkYb5r'
                ],
                'color': '#40476D'
            },
            'doge': {
                'addresses': [
                    'DEdSM4WbuQ8FsxNHDDfEiN7oGN1MgPj7kX'
                ],
                'color': '#BA9F33'
            }
        };
    }


    init()
    {
        this.initializeChart();
        this.load().then((result) =>
        {
            console.log('async method done');
        });
    }

    initializeChart()
    {
        this.chart = new Chart(
            document.querySelector('.chart'),
            {
                type: 'line',
                /*
                data: {
                    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                */
                data: {

                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 2000,
                        easing: 'easeOutCirc'
                    },
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                                unitStepSize: 1,
                                displayFormats: {
                                    'day': 'DD.MM.'
                                }
                            },
                            distribution: 'linear',
                            ticks: {
                                fontColor: 'white',
                                showLabelBackdrop: false,
                                fontStyle: 'bold'
                            },
                            pointLabels: {
                                fontColor: 'white'
                            },
                            gridLines: {
                                color: 'rgba(255, 255, 255, 0.2)'
                            },
                            angleLines: {
                                color: 'white'
                            }
                        }],
                        yAxes: [{
                            /*
                            scaleLabel: {
                                display: true,
                                labelString: 'Wert in €',
                                fontColor: 'white'
                            },
                            */
                            ticks: {
                                beginAtZero: true,
                                fontColor: 'white',
                                showLabelBackdrop: false,
                                fontStyle: 'bold',
                                callback: (value, index, values) => { return value+' €'; }
                            },
                            pointLabels: {
                                fontColor: 'white'
                            },
                            gridLines: {
                                color: 'rgba(255, 255, 255, 0.2)'
                            },
                            angleLines: {
                                color: 'white'
                            }
                        }]
                    },
                    legend: {
                      position: 'top',
                      labels: {
                        fontColor: 'white',
                        fontStyle: 'bold'
                      }
                    },
                }
            }
        );
    }

    async load()
    {        
        // loop through all coins
        for(const [coin, data] of Object.entries(this.wallet))
        {
            // loop through all addresses
            for(let address of data.addresses)
            {
                let balance;
                let api = await this.getBalance(coin, address).then((data) => {
                    balance = data.final_balance;
                }).catch((error) => {
                    balance = ~~(Math.random()*(10000000-1000000+1))+1000000;
                    if( coin === 'btc' ) { balance *= 0.05; }
                    if( coin === 'eth' ) { balance *= 10000000000; }
                    console.log('RANDOM');
                });
                console.log(balance);
                this.setBalance(coin, address, balance);          
            }

            // balances of coin is finished: get market cap of this coin (don't await)
            let marketcap = this.getMarketCap(coin).catch(error => console.log(error)).then((data) => 
            {
                this.addToChart(coin, data.Data);
                // if this was last
                if( this.chart.data.datasets.length === Object.keys(this.wallet).length )
                {
                    // throttle
                    setTimeout(() => 
                    {
                        this.sumUpData();
                    },2000);
                    console.log(this.wallet);
                }
            });
        }
    }

    sumUpData()
    {
        let dataset = {
            label: '*',
            backgroundColor: '#ffffff10',
            borderColor: '#ffffff',
            fill: true,
            data: []
        }
        this.chart.data.datasets[0].data.forEach((data__value, data__key) =>
        {
            let sum = 0;
            for( let dataset__value of this.chart.data.datasets )
            {
                sum += dataset__value.data[data__key].y;
            }
            sum = (Math.round(sum*100)/100);
            dataset.data.push({
                t: data__value.t,
                y: sum
            });
        });
        this.chart.data.datasets.push(dataset);
        this.chart.update();
    }

    addToChart(coin, data)
    {
        let dataset = {
            label: coin.toUpperCase(),
            backgroundColor: this.wallet[coin].color+'10', // hexa color
            borderColor: this.wallet[coin].color,
            fill: true,
            data: []
        }
        for(let data__value of data)
        {
            dataset.data.push({
                t: new Date(data__value.time * 1000),
                y: this.calcFinalValue(coin, data__value.close)
            });
        }
        if( this.chart.data.datasets.length === 0 )
        {
            document.querySelector('.chart').classList.remove('chart--hidden');
        }
        this.chart.data.datasets.push(dataset);
        this.chart.update();
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