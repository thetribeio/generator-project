/**
 * Transform a name into a valid variable name.
 */
const varify = (name: string) => name.replace(/-/g, '_');

export default varify;
