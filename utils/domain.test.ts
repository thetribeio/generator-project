import { rootDomain, subdomain } from './domain';

test('rootDomain return the root domain of a domain', () => {
    expect(rootDomain('test.example.com')).toBe('example.com');
});

test('subdomain return the subdomain of a domain', () => {
    expect(subdomain('test.example.com')).toBe('test');
});

test('subdomain return the correct subdomain when depth is more than 3', () => {
    expect(subdomain('another.test.example.com')).toBe('another.test');
});

test('subdomain return an empty string for a root domain', () => {
    expect(subdomain('example.com')).toBe('');
});
