import React, { useEffect, useRef, useState } from 'react';
import {
  CombineIcon,
  EraserIcon,
  LayersIcon,
  PlusIcon,
  SplitIcon,
  Trash2Icon } from
'lucide-react';
import {
  HEADER_ROWS,
  addColumn,
  addFloor,
  createBlock,
  mergeCells,
  removeColumn,
  removeFloor,
  renameColumn,
  renameFloor,
  segmentAt,
  setCellValue,
  splitCells,
  suggestColumnName,
  suggestFloorName,
  type GridBlock,
  type GridModel,
  type HeaderRowId } from
'../gridModel';
import type { ParsedUnit, UnitStatusValue } from '../inventoryParser';

const STATUS_STYLES: Record<UnitStatusValue, {color: string;background: string;}> = {
  'Còn hàng': { color: '#047857', background: '#d1fae5' },
  'Đã lock': { color: 'rgba(245, 187, 39, 1)', background: 'rgba(245, 187, 39, 0.2)' },
  'Đã cọc': { color: 'rgba(129, 55, 4, 1)', background: 'rgba(129, 55, 4, 0.2)' },
  'Đã bán': { color: '#ff0000', background: 'rgba(255, 0, 0, 0.2)' }
};

interface Selection {
  blockId: string;
  rowId: HeaderRowId;
  start: number;
  end: number;
}

interface InventoryGridEditorProps {
  model: GridModel;
  onChange: (model: GridModel) => void;
  /** Bật soạn thảo; tắt thì chỉ xem, dùng cho trang công khai. */
  editable: boolean;
  /** Tra căn theo tầng và trục để đổ vào ô dữ liệu. */
  unitAt: (floor: string, column: string) => ParsedUnit | undefined;
  renderPrice: (unit: ParsedUnit) => string;
  isVisible: (unit: ParsedUnit) => boolean;
  onSelectUnit: (unit: ParsedUnit) => void;
}

export function InventoryGridEditor({
  model,
  onChange,
  editable,
  unitAt,
  renderPrice,
  isVisible,
  onSelectUnit
}: InventoryGridEditorProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [menu, setMenu] = useState<{x: number;y: number;} | null>(null);
  const longPress = useRef<number | null>(null);

  // Thả chuột ở bất kỳ đâu đều kết thúc thao tác bôi đen.
  useEffect(() => {
    if (!isDragging) return;
    const stop = () => setIsDragging(false);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [isDragging]);

  // Đóng menu khi bấm ra ngoài hoặc nhấn Escape.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(null);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  function updateBlock(blockId: string, patch: (block: GridBlock) => GridBlock) {
    onChange({
      blocks: model.blocks.map((block) => block.id === blockId ? patch(block) : block)
    });
  }

  /** Bắt đầu bôi đen: bấm giữ rồi rê sang các ô kế bên. */
  function startSelect(
  event: React.MouseEvent,
  blockId: string,
  rowId: HeaderRowId,
  index: number)
  {
    if (!editable || event.button === 2) return;

    if (event.shiftKey && selection?.blockId === blockId && selection.rowId === rowId) {
      setSelection({ ...selection, end: index });
      return;
    }
    setSelection({ blockId, rowId, start: index, end: index });
    setIsDragging(true);
  }

  /** Rê qua ô khác cùng dòng thì mở rộng vùng chọn. */
  function extendSelect(blockId: string, rowId: HeaderRowId, index: number) {
    if (!isDragging || !selection) return;
    if (selection.blockId !== blockId || selection.rowId !== rowId) return;
    setSelection({ ...selection, end: index });
  }

  /** Chuột phải mở menu; nếu bấm ngoài vùng đang chọn thì chọn lại ô đó. */
  function openMenu(
  event: React.MouseEvent,
  blockId: string,
  rowId: HeaderRowId,
  index: number)
  {
    if (!editable) return;
    event.preventDefault();

    const inside =
    selection?.blockId === blockId &&
    selection.rowId === rowId &&
    index >= Math.min(selection.start, selection.end) &&
    index <= Math.max(selection.start, selection.end);

    if (!inside) setSelection({ blockId, rowId, start: index, end: index });
    setMenu({ x: event.clientX, y: event.clientY });
  }

  /** Cảm ứng: chạm giữ 500 ms mở đúng menu đó. */
  function startLongPress(
  event: React.TouchEvent,
  blockId: string,
  rowId: HeaderRowId,
  index: number)
  {
    if (!editable) return;
    const touch = event.touches[0];
    longPress.current = window.setTimeout(() => {
      const inside =
      selection?.blockId === blockId &&
      selection.rowId === rowId &&
      index >= Math.min(selection.start, selection.end) &&
      index <= Math.max(selection.start, selection.end);
      if (!inside) setSelection({ blockId, rowId, start: index, end: index });
      setMenu({ x: touch.clientX, y: touch.clientY });
    }, 500);
  }

  function cancelLongPress() {
    if (longPress.current) {
      window.clearTimeout(longPress.current);
      longPress.current = null;
    }
  }

  /** Bàn phím: Shift + mũi tên mở rộng vùng, Ctrl/Cmd + M gộp. */
  function handleKeyDown(event: React.KeyboardEvent) {
    if (!editable || !selection || !activeBlock) return;

    if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const next = Math.min(
        Math.max(selection.end + step, 0),
        activeBlock.columns.length - 1
      );
      setSelection({ ...selection, end: next });
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'm') {
      event.preventDefault();
      if (event.shiftKey) doSplit();else
      doMerge();
    }
  }

  const activeBlock = model.blocks.find((block) => block.id === selection?.blockId);
  const canMerge = Boolean(selection && selection.start !== selection.end);
  const canSplit = Boolean(
    selection &&
    activeBlock &&
    segmentAt(activeBlock.headers[selection.rowId], selection.start).span > 1
  );

  function doMerge() {
    if (!selection || !canMerge) return;
    updateBlock(selection.blockId, (block) => ({
      ...block,
      headers: {
        ...block.headers,
        [selection.rowId]: mergeCells(
          block.headers[selection.rowId],
          selection.start,
          selection.end
        )
      }
    }));
    setSelection({ ...selection, end: selection.start });
  }

  function doSplit() {
    if (!selection) return;
    updateBlock(selection.blockId, (block) => ({
      ...block,
      headers: {
        ...block.headers,
        [selection.rowId]: splitCells(block.headers[selection.rowId], selection.start)
      }
    }));
  }

  return (
    <div className="space-y-5" onKeyDown={handleKeyDown}>
      {editable &&
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e0d2bd] bg-[#faf7f1] px-3 py-2">
          <span className="text-[12px] text-[#6b5d4d]">
            Bôi đen các ô rồi <b>bấm chuột phải</b> · trên máy cảm ứng thì{' '}
            <b>chạm giữ</b> · hoặc dùng hai nút bên phải
          </span>
          <div className="ml-auto flex gap-2">
            <button
            type="button"
            onClick={doMerge}
            disabled={!canMerge}
            className="inline-flex items-center gap-1.5 rounded border border-[#d9cdb8] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#4a3728] transition-colors hover:bg-[#f7f2ea] disabled:cursor-not-allowed disabled:opacity-40">

              <CombineIcon className="h-3.5 w-3.5" />
              Gộp ô
            </button>
            <button
            type="button"
            onClick={doSplit}
            disabled={!canSplit}
            className="inline-flex items-center gap-1.5 rounded border border-[#d9cdb8] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#4a3728] transition-colors hover:bg-[#f7f2ea] disabled:cursor-not-allowed disabled:opacity-40">

              <SplitIcon className="h-3.5 w-3.5" />
              Tách ô
            </button>
          </div>
        </div>
      }

      {model.blocks.map((block, blockIndex) =>
      <BlockTable
        key={block.id}
        block={block}
        blockIndex={blockIndex}
        editable={editable}
        selection={selection && selection.blockId === block.id ? selection : null}
        onStartSelect={startSelect}
        onExtendSelect={extendSelect}
        onOpenMenu={openMenu}
        onLongPressStart={startLongPress}
        onLongPressCancel={cancelLongPress}
        onChangeBlock={(patch) => updateBlock(block.id, patch)}
        onRemoveBlock={
        model.blocks.length > 1 ?
        () =>
        onChange({ blocks: model.blocks.filter((item) => item.id !== block.id) }) :
        undefined
        }
        unitAt={unitAt}
        renderPrice={renderPrice}
        isVisible={isVisible}
        onSelectUnit={onSelectUnit} />

      )}

      {menu &&
      <div
        role="menu"
        className="fixed z-[90] min-w-[190px] overflow-hidden rounded-lg bg-white py-1 shadow-2xl ring-1 ring-black/10"
        style={{ top: menu.y, left: menu.x }}
        onMouseDown={(event) => event.stopPropagation()}>

          <MenuItem
          icon={<CombineIcon className="h-3.5 w-3.5" />}
          label="Gộp ô"
          hint="Ctrl+M"
          disabled={!canMerge}
          onClick={() => {
            doMerge();
            setMenu(null);
          }} />

          <MenuItem
          icon={<SplitIcon className="h-3.5 w-3.5" />}
          label="Tách ô"
          hint="Ctrl+Shift+M"
          disabled={!canSplit}
          onClick={() => {
            doSplit();
            setMenu(null);
          }} />

          <div className="my-1 h-px bg-[#eee4d5]" />
          <MenuItem
          icon={<EraserIcon className="h-3.5 w-3.5" />}
          label="Xóa nội dung ô"
          onClick={() => {
            if (selection) {
              updateBlock(selection.blockId, (block) => ({
                ...block,
                headers: {
                  ...block.headers,
                  [selection.rowId]: setCellValue(
                    block.headers[selection.rowId],
                    selection.start,
                    ''
                  )
                }
              }));
            }
            setMenu(null);
          }} />

        </div>
      }

      {editable &&
      <button
        type="button"
        onClick={() =>
        onChange({
          blocks: [...model.blocks, createBlock(`Khối ${model.blocks.length + 1}`)]
        })
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#c9b795] py-3 text-[13px] font-semibold text-[#8a6a3f] transition-colors hover:bg-[#faf6ef]">

          <LayersIcon className="h-4 w-4" />
          Thêm khối — penthouse, duplex hoặc khối có cấu trúc trục riêng
        </button>
      }
    </div>);

}

/* ═══════════════════════════════════════════════════════════════
   Một khối
   ═══════════════════════════════════════════════════════════════ */

interface BlockTableProps {
  block: GridBlock;
  blockIndex: number;
  editable: boolean;
  selection: Selection | null;
  onStartSelect: (event: React.MouseEvent, blockId: string, rowId: HeaderRowId, index: number) => void;
  onExtendSelect: (blockId: string, rowId: HeaderRowId, index: number) => void;
  onOpenMenu: (event: React.MouseEvent, blockId: string, rowId: HeaderRowId, index: number) => void;
  onLongPressStart: (event: React.TouchEvent, blockId: string, rowId: HeaderRowId, index: number) => void;
  onLongPressCancel: () => void;
  onChangeBlock: (patch: (block: GridBlock) => GridBlock) => void;
  onRemoveBlock?: () => void;
  unitAt: (floor: string, column: string) => ParsedUnit | undefined;
  renderPrice: (unit: ParsedUnit) => string;
  isVisible: (unit: ParsedUnit) => boolean;
  onSelectUnit: (unit: ParsedUnit) => void;
}

function BlockTable({
  block,
  blockIndex,
  editable,
  selection,
  onStartSelect,
  onExtendSelect,
  onOpenMenu,
  onLongPressStart,
  onLongPressCancel,
  onChangeBlock,
  onRemoveBlock,
  unitAt,
  renderPrice,
  isVisible,
  onSelectUnit
}: BlockTableProps) {
  const columnCount = block.columns.length;

  return (
    <div className="overflow-hidden rounded-lg border border-[#cfe3d4]">
      <div className="flex flex-wrap items-center gap-2 bg-[#eaf5ec] px-3 py-2">
        <LayersIcon className="h-3.5 w-3.5 shrink-0 text-[#1e7b45]" />
        {editable ?
        <input
          value={block.name}
          onChange={(event) =>
          onChangeBlock((current) => ({ ...current, name: event.target.value }))
          }
          className="min-w-0 flex-1 bg-transparent text-[13px] font-bold text-[#14532d] outline-none focus:bg-white focus:px-1.5" /> :


        <span className="flex-1 text-[13px] font-bold text-[#14532d]">{block.name}</span>
        }
        <span className="text-[11px] text-[#3f7a55]">
          {columnCount} trục · {block.floors.length} tầng
        </span>
        {editable && onRemoveBlock && blockIndex > 0 &&
        <button
          type="button"
          onClick={onRemoveBlock}
          className="grid h-6 w-6 place-items-center rounded text-[#3f7a55] transition-colors hover:bg-white hover:text-[#c0392b]"
          title="Xóa khối">

            <Trash2Icon className="h-3.5 w-3.5" />
          </button>
        }
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center text-[12px]">
          <thead>
            {/* Dòng trục căn */}
            <tr>
              <th className="sticky left-0 z-10 border border-white bg-[#1e7b45] px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
                TẦNG/CĂN
              </th>
              {block.columns.map((column, index) =>
              <th key={index} className="border border-white bg-[#1e7b45] px-1 py-1.5">
                  <div className="flex items-center justify-center gap-0.5">
                    {editable ?
                  <input
                    value={column}
                    onChange={(event) =>
                    onChangeBlock((current) =>
                    renameColumn(current, index, event.target.value)
                    )
                    }
                    className="w-10 bg-transparent text-center text-[11px] font-bold text-white outline-none focus:bg-white/20" /> :


                  <span className="text-[11px] font-bold text-white">{column}</span>
                  }
                    {editable && columnCount > 1 &&
                  <button
                    type="button"
                    onClick={() => onChangeBlock((current) => removeColumn(current, index))}
                    className="text-white/50 transition-colors hover:text-white"
                    title={`Xóa trục ${column}`}>

                        <Trash2Icon className="h-3 w-3" />
                      </button>
                  }
                  </div>
                </th>
              )}
              {editable &&
              <th className="w-9 border border-white bg-[#1e7b45] p-0">
                  <button
                  type="button"
                  onClick={() =>
                  onChangeBlock((current) =>
                  addColumn(current, current.columns.length, suggestColumnName(current))
                  )
                  }
                  className="grid h-full w-full place-items-center text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                  title="Thêm trục căn">

                    <PlusIcon className="h-4 w-4" />
                  </button>
                </th>
              }
              <th className="sticky right-0 z-10 border border-white bg-[#1e7b45] px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
                TẦNG/CĂN
              </th>
            </tr>

            {/* Năm dòng thuộc tính, có gộp ô */}
            {HEADER_ROWS.map((row) => {
              const cells = block.headers[row.id];
              const isView = row.id === 'view';

              return (
                <tr key={row.id}>
                  <th className="sticky left-0 z-10 border border-white bg-[#1e7b45] px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-white">
                    {row.label}
                  </th>
                  {cells.map((cell, index) => {
                    if (!cell) return null;
                    const inSelection =
                    selection?.rowId === row.id &&
                    index >= Math.min(selection.start, selection.end) &&
                    index <= Math.max(selection.start, selection.end);

                    return (
                      <td
                        key={index}
                        colSpan={cell.span}
                        onMouseDown={(event) => onStartSelect(event, block.id, row.id, index)}
                        onMouseEnter={() => onExtendSelect(block.id, row.id, index)}
                        onContextMenu={(event) => onOpenMenu(event, block.id, row.id, index)}
                        onTouchStart={(event) => onLongPressStart(event, block.id, row.id, index)}
                        onTouchEnd={onLongPressCancel}
                        onTouchMove={onLongPressCancel}
                        className={`select-none border border-white px-1 py-1 ${
                        isView ? 'bg-[#fbdede]' : 'bg-[#d9f0dc]'} ${
                        editable ? 'cursor-pointer' : ''} ${
                        inSelection ?
                        'bg-[#ffe9cf]/90 outline outline-2 -outline-offset-2 outline-[#f5921f]' :
                        ''}`
                        }>

                        {editable ?
                        <input
                          value={cell.value}
                          onChange={(event) =>
                          onChangeBlock((current) => ({
                            ...current,
                            headers: {
                              ...current.headers,
                              [row.id]: setCellValue(
                                current.headers[row.id],
                                index,
                                event.target.value
                              )
                            }
                          }))
                          }
                          placeholder="—"
                          className={`w-full bg-transparent text-center text-[11.5px] font-semibold outline-none placeholder:font-normal placeholder:text-black/25 ${
                          isView ? 'text-[#8b1a1a]' : 'text-[#14532d]'}`
                          } /> :


                        <span
                          className={`text-[11.5px] font-semibold ${
                          isView ? 'text-[#8b1a1a]' : 'text-[#14532d]'}`
                          }>

                            {cell.value || '—'}
                          </span>
                        }
                      </td>);

                  })}
                  {editable && <td className="border border-white bg-[#eaf5ec]" />}
                  <th className="sticky right-0 z-10 border border-white bg-[#1e7b45] px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-white">
                    {row.label}
                  </th>
                </tr>);

            })}
          </thead>

          <tbody>
            {block.floors.map((floor, floorIndex) =>
            <tr key={`${floor}-${floorIndex}`}>
                <th className="sticky left-0 z-10 border border-white bg-[#b8e6c4] px-2 py-1">
                  <div className="flex items-center justify-center gap-0.5">
                    {editable ?
                  <input
                    value={floor}
                    onChange={(event) =>
                    onChangeBlock((current) =>
                    renameFloor(current, floorIndex, event.target.value)
                    )
                    }
                    className="w-10 bg-transparent text-center text-[11.5px] font-bold text-[#14532d] outline-none focus:bg-white" /> :


                  <span className="text-[11.5px] font-bold text-[#14532d]">{floor}</span>
                  }
                    {editable && block.floors.length > 1 &&
                  <button
                    type="button"
                    onClick={() => onChangeBlock((current) => removeFloor(current, floorIndex))}
                    className="text-[#14532d]/40 transition-colors hover:text-[#c0392b]"
                    title={`Xóa tầng ${floor}`}>

                        <Trash2Icon className="h-3 w-3" />
                      </button>
                  }
                  </div>
                </th>

                {block.columns.map((column, index) => {
                const unit = unitAt(floor, column);
                const show = unit && isVisible(unit);
                const style = unit ? STATUS_STYLES[unit.status] : null;

                return (
                  <td key={index} className="border border-[#cfe3d4] p-0.5">
                      {show && unit && style &&
                    <button
                      type="button"
                      onClick={() => onSelectUnit(unit)}
                      className="flex h-full min-h-[30px] w-full flex-col items-center justify-center rounded-sm px-1 py-0.5 transition-opacity hover:opacity-80"
                      style={{ backgroundColor: style.background, color: style.color }}
                      title={`${unit.code} · ${unit.status}`}>

                          <span className="text-[11px] font-bold leading-tight">
                            {renderPrice(unit)}
                          </span>
                        </button>
                    }
                    </td>);

              })}
                {editable && <td className="border border-[#cfe3d4] bg-[#f7fbf8]" />}
                <th className="sticky right-0 z-10 border border-white bg-[#b8e6c4] px-2 py-1 text-[11.5px] font-bold text-[#14532d]">
                  {floor}
                </th>
              </tr>
            )}

            {editable &&
            <tr>
                <td colSpan={columnCount + 3} className="border border-[#cfe3d4] bg-[#f7fbf8] p-0">
                  <button
                  type="button"
                  onClick={() =>
                  onChangeBlock((current) =>
                  addFloor(current, current.floors.length, suggestFloorName(current))
                  )
                  }
                  className="flex w-full items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold text-[#3f7a55] transition-colors hover:bg-[#eaf5ec]">

                    <PlusIcon className="h-3.5 w-3.5" />
                    Thêm tầng
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>);

}

/* ═══════════════════════════════════════════════════════════════
   Mục trong menu ngữ cảnh
   ═══════════════════════════════════════════════════════════════ */

function MenuItem({
  icon,
  label,
  hint,
  disabled,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-stone-700 transition-colors hover:bg-[#faf6ef] disabled:cursor-not-allowed disabled:text-stone-300">

      <span className="shrink-0 text-[#b08e5c]">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint &&
      <kbd className="shrink-0 font-mono text-[10px] text-stone-400">{hint}</kbd>
      }
    </button>);

}
