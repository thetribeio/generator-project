/**
 * Transform a name into a valid variable name.
 */
const varName = (name: string): string => name.replace(/-/g, '_');

export default varName;
