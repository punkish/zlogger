import { Zlogger } from '../index.js';
const log = new Zlogger({ 
    name: 'MY-MODULE', 
    level: 'error', 
    transports: [ 'console', 'file' ] 
});

const init = () => {
    log.loglevel();
    log.warn('log a warning');
    log.info('logging is simple');
    log.error('this is an error');
}

export { init }