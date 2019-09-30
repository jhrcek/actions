import * as io from '@actions/io';
import fs = require('fs');
import os = require('os');
import path = require('path');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');

process.env['AGENT_TOOLSDIRECTORY'] = toolDir;
process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;

import {findHaskellGHCVersion, findHaskellCabalVersion} from '../src/installer';

describe('find-haskell', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);

    const ghcDir: string = path.join(tempDir, 'ghc', '8.6.5', 'bin');
    await io.mkdirP(ghcDir);
    fs.writeFileSync(`${ghcDir}.complete`, 'hello');

    const cabalDir: string = path.join(tempDir, 'cabal', '2.0', 'bin');
    await io.mkdirP(cabalDir);
    fs.writeFileSync(`${cabalDir}.complete`, 'hello');
  });

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('Uses version of ghc installed in cache', async () => {
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await findHaskellGHCVersion(tempDir, '8.6.5');
  });

  it('Uses version of cabal installed in cache', async () => {
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await findHaskellCabalVersion(tempDir, '2.0');
  });

  it('findHaskellGHCVersion throws if cannot find any version of ghc', async () => {
    let thrown = false;
    try {
      await findHaskellGHCVersion(tempDir, '9.9.9');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('findHaskellCabalVersion throws if cannot find any version of ghc', async () => {
    let thrown = false;
    try {
      await findHaskellCabalVersion(tempDir, '9.9.9');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('findHaskellGHCVersion throws without baseInstallDir', async () => {
    let thrown = false;
    try {
      await findHaskellGHCVersion('', '8.6.5');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });
});
