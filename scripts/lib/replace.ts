import { dirname, fromFileUrl, join } from "https://deno.land/std@0.98.0/path/mod.ts";

const root = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

const replace = async (file: string, regexp: RegExp, replacer: string) => {
    const path = join(root, file);

    const content = await Deno.readTextFile(path);

    await Deno.writeTextFile(path, content.replace(regexp, replacer));
};

export default replace;
