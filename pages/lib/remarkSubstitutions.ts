import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text } from 'mdast';

const remarkSubstitutions: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text) => {
      node.value = node.value
        .replace(/->/g, '→')
        .replace(/<-/g, '←')
        .replace(/<3/g, '♥');
    });
  };
};

export default remarkSubstitutions;
