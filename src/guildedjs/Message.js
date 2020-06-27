import { v4 as uuidv4 } from 'uuid';

import sessionData, { USER_AGENT } from './session';

/*
 * recursively parsing nodes
 */
function parseNode(node) {
  let text = '';
  if (node.nodes) {
    for (let i = 0; i < node.nodes.length; i += 1) {
      if (text) {
        text += ' ';
      }
      text += parseNode(node.nodes[i]);
    }
  }
  if (node.leaves) {
    if (text) {
      text += ' ';
    }
    for (let i = 0; i < node.leaves.length; i += 1) {
      text += parseNode(node.leaves[i]);
    }
  }
  if (node.text) {
    if (text) {
      text += ' ';
    }
    text += node.text;
  }
  return text;
}


class Message {
  constructor(data, channel = null, guild = null) {
    if (typeof data === 'string') {
      // create new message from string
      this.id = uuidv4();
      this.guild = guild;
      this.channel = channel;
      this.text = data;
      this.content = {
        document: {
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              data: {},
              nodes: [
                {
                  leaves: [
                    {
                      object: 'leaf',
                      marks: [],
                      text: data,
                    }
                  ],
                  object: 'text',
                },
              ],
            }
          ],
          object: 'document',
        },
        object: 'value',
      }
    } else {
      // create message from ChatMessageCreated package
      this.id = data.id;
      this.guild = guild;
      this.channel = channel;
      this.content = data.content;
      this.text = parseNode(data.content.document);
    }
  }
}

export default Message;
