/**
 * @zudo/docs/generator
 *
 * Output generators — markdown and JSON for documentation.
 */

export { generateMarkdown } from "./generatorMarkdown.core.js";
export { nodesToMarkdown } from "./generatorMarkdownNodes.js";
export { generateJSON, generateIndex } from "./generatorJson.core.js";

export type { MarkdownGeneratorOptions } from "./generator.types.js";
