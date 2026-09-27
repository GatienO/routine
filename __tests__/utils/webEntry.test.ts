import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { resolve } from 'node:path';

const entry = readFileSync(resolve(__dirname, '../../index.js'), 'utf8');

it('provides process.env before loading Expo Router in a browser', () => {
  const context: Record<string, unknown> = {};
  context.require = jest.fn(() => {
    expect(context.process).toEqual({ env: {} });
  });

  runInNewContext(entry, context);
  expect(context.require).toHaveBeenCalledWith('expo-router/entry');
});

it('preserves an existing process on native platforms', () => {
  const processObject = { env: { NODE_ENV: 'test' } };
  const context = { process: processObject, require: jest.fn() };

  runInNewContext(entry, context);
  expect(context.process).toBe(processObject);
});
