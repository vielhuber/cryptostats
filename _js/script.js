import Cryptostats from './_cryptostats';

document.addEventListener('DOMContentLoaded', () =>
{

});

window.onload = () =>
{    
    let cryptostats = new Cryptostats();
    cryptostats.init();
    window.cryptostats = cryptostats;
}