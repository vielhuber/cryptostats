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
                'color': '#556270'
            },
            'eth': {
                'color': '#4ECDC4'
            },
            'ltc': {
                'color': '#C7F464'
            },
            'dash': {
                'color': '#FF6B6B'
            },
            'doge': {
                'color': '#C44D58'
            }
        };
    }

    init()
    {
        this.initializeChart();
        this.load().then((result) =>
        {
            console.log('done');
        });
    }

    initializeChart()
    {

        /* add shadow */
        /*
        let draw = Chart.controllers.line.prototype.draw;
        Chart.controllers.line.prototype.draw = function() {
            draw.apply(this, arguments);
            let ctx = this.chart.chart.ctx;
            let _stroke = ctx.stroke;
            ctx.stroke = function() {
                ctx.save();
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 4;
                _stroke.apply(this, arguments);
                ctx.restore();
            }
        };
        */

        Chart.defaults.global.defaultFontFamily = "'Ubuntu', sans-serif";
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
                    tooltips: {
                        callbacks: {
                            label: (tooltipItem, data) => {
                                return ' '+tooltipItem.yLabel.toFixed(2).replace('.',',')+' €';
                            },
                            title: (tooltipItem, data) => {

                            }
                        }
                    }
                }
            }
        );
    }

    async load()
    {        
        // read addresses from config
        await this.readConfigToWallet();

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

    readConfigToWallet()
    {
        return new Promise((resolve,reject) => {
            Helpers.get(
                'wallet.json',
                (data) => {
                    for(const [data__key, data__value] of Object.entries(data)) {
                        this.wallet[data__key].addresses = data__value;
                    }
                    resolve();
                },
                (error) => {
                    reject();
                }
            );
        });
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