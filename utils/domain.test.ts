import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { rootDomain, subdomain } from './domain';

test('rootDomain return the root domain of a domain', () => {
    assert.equal(rootDomain('test.example.com'), 'example.com');
});

test('subdomain return the subdomain of a domain', () => {
    assert.equal(subdomain('test.example.com'), 'test');
});

test('subdomain return the correct subdomain when depth is more than 3', () => {
    assert.equal(subdomain('another.test.example.com'), 'another.test');
});

test('subdomain return an empty string for a root domain', () => {
    assert.equal(subdomain('example.com'), '');
});
