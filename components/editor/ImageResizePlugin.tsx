'use client';

import { Plugin, PluginKey, NodeSelection } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

const key = new PluginKey('image-resize');
const MIN = 50;
const MAX = 1200;
const HANDLE_SIZE = 16;

export function createImageResizePlugin() {
  return new Plugin({
    key,
    view(view) {
      const container = view.dom.parentElement;
      if (!container) return {};

      // 오버레이용 positioning context 확보
      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }

      // 리사이즈 핸들 생성 (부모 컨테이너에 붙임)
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'resize-handle';
      Object.assign(handle.style, {
        position: 'absolute',
        width: `${HANDLE_SIZE}px`,
        height: `${HANDLE_SIZE}px`,
        backgroundColor: '#3b82f6',
        border: '2px solid white',
        borderRadius: '50%',
        cursor: 'se-resize',
        display: 'none',
        zIndex: '1000',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.1s',
        pointerEvents: 'auto',
      });
      container.appendChild(handle);

      let active: { pos: number; node: ProseMirrorNode; img: HTMLImageElement } | null = null;
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let startW = 0;
      let startH = 0;
      let aspect = 1;

      // 핸들 위치 업데이트
      const positionHandle = () => {
        if (!active) return;
        const imgRect = active.img.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const left = imgRect.right - containerRect.left + container.scrollLeft - HANDLE_SIZE / 2;
        const top = imgRect.bottom - containerRect.top + container.scrollTop - HANDLE_SIZE / 2;

        handle.style.left = `${left}px`;
        handle.style.top = `${top}px`;
      };

      // 드래그 중 크기 조절
      const onMouseMove = (e: MouseEvent) => {
        if (!dragging || !active) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let nextW = Math.max(MIN, Math.min(MAX, startW + dx));
        let nextH = Math.max(MIN, Math.min(MAX, startH + dy));

        // Shift 키: 비율 유지
        if (e.shiftKey) {
          nextH = Math.max(MIN, Math.min(MAX, nextW / aspect));
        }

        active.img.style.width = `${Math.round(nextW)}px`;
        active.img.style.height = `${Math.round(nextH)}px`;
        positionHandle();
      };

      // 드래그 종료 시 크기 저장
      const onMouseUp = () => {
        if (!dragging || !active) return;
        dragging = false;

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        const width = parseInt(active.img.style.width, 10) || Math.round(startW);
        const height = parseInt(active.img.style.height, 10) || Math.round(startH);

        const { state } = view;
        const nodeNow = state.doc.nodeAt(active.pos);
        if (!nodeNow) return;

        // 노드 속성에 크기 저장
        const tr = state.tr.setNodeMarkup(active.pos, undefined, {
          ...nodeNow.attrs,
          width,
          height,
        });
        view.dispatch(tr);
      };

      // 드래그 시작
      const onMouseDown = (e: MouseEvent) => {
        if (!active) return;
        e.preventDefault();
        e.stopPropagation();

        dragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = active.img.getBoundingClientRect();
        startW = rect.width;
        startH = rect.height;
        aspect = startW / (startH || 1);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };

      handle.addEventListener('mousedown', onMouseDown);

      // 선택된 이미지 감지
      const getSelectedImage = (view: EditorView) => {
        const sel = view.state.selection;
        if (!(sel instanceof NodeSelection)) return null;
        
        const node = sel.node;
        if (!node || node.type.name !== 'image') return null;

        const pos = sel.from;
        const dom = view.nodeDOM(pos) as HTMLElement;
        const img = dom instanceof HTMLImageElement ? dom : dom.querySelector('img');
        
        if (!img) return null;
        return { pos, node, img };
      };

      return {
        update(view) {
          const next = getSelectedImage(view);
          if (!next) {
            if (active) {
              active = null;
              handle.style.display = 'none';
            }
            return;
          }

          if (!active || active.pos !== next.pos) {
            active = next;
            handle.style.display = 'block';
            positionHandle();
          } else {
            positionHandle();
          }
        },
        destroy() {
          handle.removeEventListener('mousedown', onMouseDown);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          handle.remove();
        },
      };
    },
  });
}

