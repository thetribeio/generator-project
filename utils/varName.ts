/**
 * Transform a name into a valid variable name.
 */
const varName = (name: string) => name.replace(/-/g, '_');

export default varName;
