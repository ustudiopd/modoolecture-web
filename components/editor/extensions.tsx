'use client';

import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import YouTube from '@tiptap/extension-youtube';
import { ImageResizeExtension } from './extensions/ImageResizeExtension';

export const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    link: false, // StarterKit의 link 비활성화 (아래에서 별도로 추가)
  }),
  Underline,
  Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
          parseHTML: (element) => {
            const width = element.getAttribute('width');
            return width ? parseInt(width, 10) : null;
          },
          renderHTML: (attributes) => {
            if (!attributes.width) {
              return {};
            }
            return {
              width: attributes.width,
            };
          },
        },
        height: {
          default: null,
          parseHTML: (element) => {
            const height = element.getAttribute('height');
            return height ? parseInt(height, 10) : null;
          },
          renderHTML: (attributes) => {
            if (!attributes.height) {
              return {};
            }
            return {
              height: attributes.height,
            };
          },
        },
      };
    },
  }).configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class: 'rounded-lg border border-slate-700 resizable-image',
      style: 'max-width: 100%; height: auto; max-height: 600px; object-fit: contain; cursor: pointer;',
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-cyan-400 hover:text-cyan-300 underline',
    },
  }),
  YouTube,
  ImageResizeExtension,
];

