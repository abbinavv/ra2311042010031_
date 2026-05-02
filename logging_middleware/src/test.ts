import { Log } from './index';

async function testLogging() {
  console.log('Testing logging middleware...');
  await Log('backend', 'info', 'handler', 'Testing log from backend handler');
  console.log('Log sent successfully');
}

testLogging().catch(err => console.error('Test failed:', err));
