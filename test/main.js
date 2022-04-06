import { Zlogger } from '../index.js';
const log = new Zlogger({ 
    name: 'MAIN', 
    level: 'info', 
    transports: [ 'console', 'file' ] 
});

log.loglevel();
log.info('foo');
log.info('do something and wait… ', 'start');
log.info('finished something\n', 'end');
log.warn('oops');
log.error('uh oh!');

import { init } from './my-module.js';
init();