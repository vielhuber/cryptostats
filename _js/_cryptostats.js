import https from 'https';
import Helpers from './_helpers';
import Chart from 'chart.js';

export default class Cryptostats
{

    init()
    {
        this.initChart();
        this.loadData();
    }

    initChart()
    {

        Chart.defaults.global.defaultFontFamily = "'Ubuntu', sans-serif";
        this.chart = new Chart(
            document.querySelector('.chart__inner'),
            {
                type: 'line',                
                data: null,
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
                    tooltips: {
                        callbacks: {
                            label: (tooltipItem, data) => {
                                return ' '+tooltipItem.yLabel.toFixed(2).replace('.',',')+' €';
                            },
                            title: (tooltipItem, data) => { }
                        }
                    }
                }
            }
        );
    }

    async loadData()
    {        
        // read addresses from config
        await this.setupWallet();

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
                });
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
                }
            });
        }
    }

    setupWallet()
    {
        return new Promise((resolve,reject) => {
            Helpers.get(
                'wallet.json',
                (data) => {
                    this.wallet = {};
                    for(const [data__key, data__value] of Object.entries(data)) {
                        this.wallet[data__key] = {
                            'addresses': data__value
                        }
                    }
                    resolve();
                },
                (error) => {
                    reject();
                }
            );
        });
    }

    getCoinColor(coin)
    {
        switch(coin)
        {
            case 'btc':
                return '#556270';
            case 'eth':
                return '#4ECDC4';
            case 'ltc':
                return '#C7F464';
            case 'dash':
                return '#FF6B6B';
            case 'doge':
                return '#C44D58';
            default: 
                return '#FFFFFF';
        }
    }

    sumUpData()
    {
        let dataset = {
            label: '*',
            backgroundColor: this.getCoinColor('*')+'10',
            borderColor: this.getCoinColor('*'),
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
            backgroundColor: this.getCoinColor(coin)+'10', // hexa color
            borderColor: this.getCoinColor(coin),
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
            document.querySelector('.chart__inner').classList.remove('chart__inner--hidden');
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
        if( coin === 'btc' || coin === 'ltc' || coin === 'dash' || coin === 'doge' )
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