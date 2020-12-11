const indent = (text: string, spaces: number): string => text
    .split('\n')
    .map((line) => ' '.repeat(spaces) + line)
    .join('\n');

export default indent;
