import Cryptostats from './_cryptostats';

window.onload = () =>
{    
    let cryptostats = new Cryptostats();
    cryptostats.init();
    window.cryptostats = cryptostats;
}