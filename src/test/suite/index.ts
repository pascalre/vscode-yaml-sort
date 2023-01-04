import { resolve, join} from 'path'
import Mocha = require('mocha')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NYC = require('nyc')
import { sync } from 'glob'

// Recommended modules, loading them here to speed up NYC init
// and minimize risk of race condition
import 'ts-node/register'

export async function run(): Promise<void> {
  const testsRoot = resolve(__dirname, '..')

    // Setup coverage pre-test, including post-test hook to report
  const nyc = new NYC({
    cwd: join(__dirname, '..', '..', '..'),
    reporter: ['text-summary', 'html', 'lcov'],
    all: true,
    silent: false,
    instrument: true,
    hookRequire: true,
    hookRunInContext: true,
    hookRunInThisContext: true,
  });
  await nyc.wrap();

  // Debug which files will be included/excluded
  // console.log('Glob verification', await nyc.exclude.glob(nyc.cwd));
  await nyc.createTempDirectory();
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
    timeout: 10 * 1000,
    color: true
	})
  
  // Add all files to the test suite
  const files = sync('**/*.test.js', { cwd: testsRoot });
  files.forEach(f => mocha.addFile(resolve(testsRoot, f)));

  const failures: number = await new Promise(executor => mocha.run(executor));
  await nyc.writeCoverageFile();

  if (failures > 0) {
    throw new Error(`${failures} tests failed.`);
  }
}
