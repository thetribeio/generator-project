/**
 * Extract the root domain of a domain.
 */
const rootDomain = (domain: string): string => domain.split('.').slice(-2).join('.');

/**
 * Extract the subdomain of a domain.
 */
const subdomain = (domain: string): string => domain.split('.').slice(0, -2).join('.');

export { rootDomain, subdomain };
