'use client';

import { Extension } from '@tiptap/core';
import { createImageResizePlugin } from '../ImageResizePlugin';

export const ImageResizeExtension = Extension.create({
  name: 'imageResize',
  addProseMirrorPlugins() {
    return [createImageResizePlugin()];
  },
});





