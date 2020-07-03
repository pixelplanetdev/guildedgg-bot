import { v4 as uuidv4 } from 'uuid';

import sessionData, { USER_AGENT } from './session';

/*
 * recursively parsing nodes
 */
function parseNode(node) {
  let text = '';
  let attachments = [];
  if (node.nodes) {
    for (let i = 0; i < node.nodes.length; i += 1) {
      if (text) {
        text += ' ';
      }
      const {
        attachments: attachmentsChild,
        text: textChild,
      } = parseNode(node.nodes[i]);
      text += textChild;
      attachments = attachments.concat(attachmentsChild);
    }
  }
  if (node.leaves) {
    if (text) {
      text += ' ';
    }
    for (let i = 0; i < node.leaves.length; i += 1) {
      const {
        attachments: attachmentsChild,
        text: textChild,
      } = parseNode(node.leaves[i]);
      text += textChild;
      attachments = attachments.concat(attachmentsChild);
    }
  }
  if (node.text) {
    if (text) {
      text += ' ';
    }
    text += node.text;
  }
  if (node.type && node.type === 'image') {
    attachments.push(node.data.src);
  }
  return {
    attachments,
    text,
  }
}


class Message {
  constructor(
    data,
    channel = null,
    guild = null,
    user = null,
  ) {
    this.user = user;
    this.guild = guild;
    this.channel = channel;

    if (typeof data === 'string') {
      const newdata = {
        text: data,
      };
      data = newdata;
    }

    if (data.text || data.attachments || data.mentions) {
      console.log('Creating message', data);
      // create new message from string
      this.id = uuidv4();
      let text = '';
      const nodes = [];
      if (data.text || data.mentions) {
        const textnode = {
            object: 'block',
            type: 'paragraph',
            data: {},
            nodes: [],
        }
        if (data.mentions && data.mentions.length) {
          // add mentions
          for (let i = 0; i < data.mentions.length; i += 1){
            const mention = data.mentions[i];
            if (text) {
              text += ' ';
            }
            text += `@{mention}`;
            textnode.nodes.push({
              data: {
                mention: {
                  type: mention,
                  name: mention,
                  matcher: `@${mention}`,
                  id: mention,
                  description: `Ping @${mention}`,
                  color: '#f5c400',
                },
              },
              nodes: [
                Message.createTextNode(`@${mention}`),
              ],
              type: 'mention',
              object: 'inline',
            });
          }
        }
        if (data.text) {
          if (text) {
            text += ' ';
          }
          text += data.text;
          // add text
          textnode.nodes.push(Message.createTextNode(data.text));
        }
        nodes.push(textnode);
      }
      if (data.attachments && data.attachments.length) {
        // add image
        for (let i = 0; i < data.attachments.length; i += 1) {
          const attachment = data.attachments[i];
          let url = '';
          let atttext = '';
          if (typeof attachment === 'string') {
            continue;
          } else {
            url = attachment.url;
            if (!url) {
              continue;
            }
            if (attachment.text) {
              atttext = attachment.text;
              if (text) {
                text += ' ';
              }
              text += atttext;
            }
          }
          
          const attachmentNode = {
            object: 'block',
            type: 'image',
            data: {
              src: url,
            },
            nodes: [
              Message.createTextNode(atttext),
            ],
          }
          nodes.push(attachmentNode);
        }
      }
      this.content = {
        document: {
          data: {},
          nodes,
          object: 'document',
        },
        object: 'value',
      }
      this.text = text;
    } else if (data.content) {
      // create message from ChatMessageCreated package
      this.id = data.id;
      this.content = data.content;
      const {
        text,
        attachments,
      } = parseNode(data.content.document);
      this.text = text;
      this.attachments = attachments;
    }
  }

  static createTextNode(text = '') {
    return {
      leaves: [
        {
          object: 'leaf',
          marks: [],
          text: text,
        }
      ],
      object: 'text'
    }
  }

  async addAttachment(url, text = '') {
    console.log(this.content);
    this.content.document.nodes.push({
      object: 'block',
      type: 'image',
      data: {
        src: url,
      },
      nodes: [
        Message.createTextNode(text),
      ],
    });
    if (text) {
      if (this.text) {
        this.text += ' ';
      }
      this.text += text;
    }
  }

  reply(data) {
    if (this.channel) {
      this.channel.send(data);
    } else {
      throw new Error('This message has no channel defined.');
    }
  }
}

export default Message;
