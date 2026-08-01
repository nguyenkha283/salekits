import React, { useEffect, useRef, useState } from 'react';
import {
  BanIcon,
  CombineIcon,
  LayersIcon,
  Columns3Icon,
  Rows3Icon,
  SplitIcon,
  Trash2Icon } from
'lucide-react';
import {
  HEADER_ROWS,
  addColumn,
  addFloor,
  cellWidth,
  mergeCells,
  mergeColumns,
  physicalWidth,
  setColumnsDisabled,
  removeBlock,
  removeColumn,
  removeFloor,
  renameColumn,
  renameFloor,
  segmentAt,
  setCellValue,
  splitBlockAt,
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

/** Ba kiểu vùng chọn, quyết định nút nào trên thanh công cụ sáng lên. */
type Selection =
{kind: 'header';blockId: string;rowId: HeaderRowId;start: number;end: number;} |
{kind: 'column';blockId: string;start: number;end: number;} |
{kind: 'floor';blockId: string;index: number;} |
{kind: 'block';blockId: string;};

interface InventoryGridEditorProps {
  model: GridModel;
  onChange: (model: GridModel) => void;
  editable: boolean;
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const longPress = useRef<number | null>(null);

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

  const activeBlock = selection ?
  model.blocks.find((block) => block.id === selection.blockId) :
  undefined;

  /* ── Điều kiện bật từng nút trên thanh công cụ ─────────────── */
  /** Gộp: dùng chung cho ô tiêu đề và cho trục căn. */
  const canMerge =
  (selection?.kind === 'header' || selection?.kind === 'column') &&
  selection.start !== selection.end;
  const canSplit = Boolean(
    selection?.kind === 'header' &&
    activeBlock &&
    segmentAt(activeBlock.headers[selection.rowId], selection.start).span > 1
  );
  const canAddColumn = selection?.kind === 'column' || selection?.kind === 'header';
  const canToggleDisabled = selection?.kind === 'column';
  /** Đang chọn toàn trục đã vô hiệu hóa thì nút chuyển thành "Bật lại". */
  const selectedAllDisabled = Boolean(
    selection?.kind === 'column' &&
    activeBlock &&
    activeBlock.columns.
    slice(
      Math.min(selection.start, selection.end),
      Math.max(selection.start, selection.end) + 1
    ).
    every((column) => column.disabled)
  );
  const canAddFloor = selection?.kind === 'floor';
  const canAddBlock = Boolean(
    selection?.kind === 'floor' &&
    activeBlock &&
    selection.index < activeBlock.floors.length - 1
  );
  const canRemoveBlock = selection?.kind === 'block' && model.blocks.length > 1;

  function updateBlock(blockId: string, patch: (block: GridBlock) => GridBlock) {
    onChange({
      blocks: model.blocks.map((block) => block.id === blockId ? patch(block) : block)
    });
  }

  /* ── Thao tác ──────────────────────────────────────────────── */
  function doMerge() {
    if (!canMerge) return;

    if (selection?.kind === 'column') {
      updateBlock(selection.blockId, (block) =>
      mergeColumns(block, selection.start, selection.end)
      );
      setSelection(null);
      return;
    }
    if (selection?.kind !== 'header') return;
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
    if (selection?.kind !== 'header') return;
    updateBlock(selection.blockId, (block) => ({
      ...block,
      headers: {
        ...block.headers,
        [selection.rowId]: splitCells(block.headers[selection.rowId], selection.start)
      }
    }));
  }

  function doToggleDisabled() {
    if (selection?.kind !== 'column') return;
    updateBlock(selection.blockId, (block) =>
    setColumnsDisabled(block, selection.start, selection.end, !selectedAllDisabled)
    );
  }

  function doAddColumn() {
    if (!selection || !canAddColumn) return;
    const at = selection.kind === 'column' ? Math.max(selection.start, selection.end) : selection.start;
    updateBlock(selection.blockId, (block) =>
    addColumn(block, at + 1, suggestColumnName(block))
    );
  }

  function doAddFloor() {
    if (selection?.kind !== 'floor') return;
    updateBlock(selection.blockId, (block) =>
    addFloor(block, selection.index + 1, suggestFloorName(block))
    );
  }

  function doAddBlock() {
    if (selection?.kind !== 'floor' || !canAddBlock) return;
    onChange(splitBlockAt(model, selection.blockId, selection.index));
    setSelection(null);
  }

  function doRemoveBlock() {
    if (selection?.kind !== 'block') return;
    onChange(removeBlock(model, selection.blockId));
    setConfirmDelete(null);
    setSelection(null);
  }

  /* ── Chọn ô tiêu đề ────────────────────────────────────────── */
  function startSelect(
  event: React.MouseEvent,
  blockId: string,
  rowId: HeaderRowId,
  index: number)
  {
    if (!editable || event.button === 2) return;
    if (
    event.shiftKey &&
    selection?.kind === 'header' &&
    selection.blockId === blockId &&
    selection.rowId === rowId)
    {
      setSelection({ ...selection, end: index });
      return;
    }
    setSelection({ kind: 'header', blockId, rowId, start: index, end: index });
    setIsDragging(true);
  }

  /** Bấm vào trục để chọn; rê ngang để chọn nhiều trục liền nhau. */
  function startColumnSelect(
  event: React.MouseEvent,
  blockId: string,
  start: number,
  end: number)
  {
    if (!editable || event.button === 2) return;

    if (event.shiftKey && selection?.kind === 'column' && selection.blockId === blockId) {
      setSelection({ ...selection, end });
      return;
    }
    setSelection({ kind: 'column', blockId, start, end });
    setIsDragging(true);
  }

  function extendColumnSelect(blockId: string, index: number) {
    if (!isDragging || selection?.kind !== 'column') return;
    if (selection.blockId !== blockId) return;
    setSelection({ ...selection, end: index });
  }

  function extendSelect(blockId: string, rowId: HeaderRowId, index: number) {
    if (!isDragging || selection?.kind !== 'header') return;
    if (selection.blockId !== blockId || selection.rowId !== rowId) return;
    setSelection({ ...selection, end: index });
  }

  function openMenu(
  event: React.MouseEvent,
  blockId: string,
  rowId: HeaderRowId,
  index: number)
  {
    if (!editable) return;
    event.preventDefault();
    const inside =
    selection?.kind === 'header' &&
    selection.blockId === blockId &&
    selection.rowId === rowId &&
    index >= Math.min(selection.start, selection.end) &&
    index <= Math.max(selection.start, selection.end);
    if (!inside) setSelection({ kind: 'header', blockId, rowId, start: index, end: index });
    setMenu({ x: event.clientX, y: event.clientY });
  }

  function startLongPress(
  event: React.TouchEvent,
  blockId: string,
  rowId: HeaderRowId,
  index: number)
  {
    if (!editable) return;
    const touch = event.touches[0];
    longPress.current = window.setTimeout(() => {
      setSelection({ kind: 'header', blockId, rowId, start: index, end: index });
      setMenu({ x: touch.clientX, y: touch.clientY });
    }, 500);
  }

  function cancelLongPress() {
    if (longPress.current) {
      window.clearTimeout(longPress.current);
      longPress.current = null;
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!editable || selection?.kind !== 'header' || !activeBlock) return;
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

  /** Số trục lớn nhất — các khối ít trục hơn được đệm cho thẳng hàng. */
  const maxColumns = Math.max(...model.blocks.map(physicalWidth), 1);

  return (
    <div className="space-y-3" onKeyDown={handleKeyDown}>
      {editable &&
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#e0d2bd] bg-[#faf7f1] px-2 py-1.5">
          <ToolButton icon={<CombineIcon />} label="Gộp ô" enabled={canMerge} onClick={doMerge} />
          <ToolButton icon={<SplitIcon />} label="Tách ô" enabled={canSplit} onClick={doSplit} />
          <span className="mx-0.5 h-5 w-px bg-[#e0d2bd]" />
          <ToolButton icon={<Columns3Icon />} label="Thêm cột" enabled={canAddColumn} onClick={doAddColumn} />
          <ToolButton
          icon={<BanIcon />}
          label={selectedAllDisabled ? 'Bật lại trục' : 'Khu vực chung'}
          enabled={canToggleDisabled}
          onClick={doToggleDisabled} />

          <ToolButton icon={<Rows3Icon />} label="Thêm hàng" enabled={canAddFloor} onClick={doAddFloor} />
          <span className="mx-0.5 h-5 w-px bg-[#e0d2bd]" />
          <ToolButton icon={<LayersIcon />} label="Thêm khối" enabled={canAddBlock} onClick={doAddBlock} />
          <ToolButton
          icon={<Trash2Icon />}
          label="Xóa khối"
          enabled={canRemoveBlock}
          danger
          onClick={() => selection?.kind === 'block' && setConfirmDelete(selection.blockId)} />

          <span className="ml-auto pr-1 text-[11.5px] text-[#9c8672]">
            {describeSelection(selection)}
          </span>
        </div>
      }

      <div className="overflow-x-auto rounded-lg border border-[#cfe3d4]">
        <table className="w-full border-collapse text-center text-[12px]">
          {model.blocks.map((block, blockIndex) => {
            const filler = maxColumns - physicalWidth(block);

            return (
              <tbody key={block.id}>
                {/* Dòng trục căn — ô góc trái chọn cả khối */}
                <tr>
                  <th
                    onClick={() =>
                    editable && setSelection({ kind: 'block', blockId: block.id })
                    }
                    className={`sticky left-0 z-10 border border-white px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white ${
                    editable ? 'cursor-pointer' : ''} ${
                    selection?.kind === 'block' && selection.blockId === block.id ?
                    'bg-[#f5921f]' :
                    'bg-[#1e7b45]'}`
                    }
                    title={editable ? 'Bấm để chọn cả khối' : undefined}>

                    TẦNG/CĂN
                  </th>
                  {groupColumns(block).map((group) => {
                    const picked =
                    selection?.kind === 'column' &&
                    selection.blockId === block.id &&
                    group.start >= Math.min(selection.start, selection.end) &&
                    group.end <= Math.max(selection.start, selection.end);
                    const column = block.columns[group.start];

                    // Nhiều trục khu vực chung liền nhau hiển thị thành một ô ghi.
                    if (group.disabled) {
                      return (
                        <th
                          key={column.id}
                          colSpan={group.width}
                          onMouseDown={(event) =>
                          startColumnSelect(event, block.id, group.start, group.end)
                          }
                          onMouseEnter={() => extendColumnSelect(block.id, group.end)}
                          className={`select-none border border-white px-1 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide ${
                          editable ? 'cursor-pointer' : ''} ${
                          picked ? 'bg-[#f5921f] text-white' : 'bg-[#9ca3af] text-white/90'}`
                          }>

                          Khu vực chung
                        </th>);

                    }

                    return (
                      <th
                        key={column.id}
                        colSpan={group.width}
                        onMouseDown={(event) =>
                        startColumnSelect(event, block.id, group.start, group.start)
                        }
                        onMouseEnter={() => extendColumnSelect(block.id, group.start)}
                        className={`select-none border border-white px-1 py-1.5 ${
                        editable ? 'cursor-pointer' : ''} ${
                        picked ? 'bg-[#f5921f]' : 'bg-[#1e7b45]'}`
                        }>

                        <div className="flex items-center justify-center gap-0.5">
                          {editable ?
                          <input
                            value={column.label}
                            onChange={(event) =>
                            updateBlock(block.id, (current) =>
                            renameColumn(current, group.start, event.target.value)
                            )
                            }
                            onMouseDown={(event) => event.stopPropagation()}
                            className="w-10 bg-transparent text-center text-[11px] font-bold text-white outline-none focus:bg-white/20" /> :


                          <span className="text-[11px] font-bold text-white">{column.label}</span>
                          }
                          {editable && picked && block.columns.length > 1 &&
                          <button
                            type="button"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={() => {
                              updateBlock(block.id, (current) => removeColumn(current, group.start));
                              setSelection(null);
                            }}
                            className="text-white/70 transition-colors hover:text-white"
                            title={`Xóa trục ${column.label}`}>

                              <Trash2Icon className="h-3 w-3" />
                            </button>
                          }
                        </div>
                      </th>);

                  })}
                  {filler > 0 && <th colSpan={filler} className="border border-white bg-[#1e7b45]" />}
                  <th className="sticky right-0 z-10 border border-white bg-[#1e7b45] px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
                    TẦNG/CĂN
                  </th>
                </tr>

                {/* Năm dòng thuộc tính */}
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
                        selection?.kind === 'header' &&
                        selection.blockId === block.id &&
                        selection.rowId === row.id &&
                        index >= Math.min(selection.start, selection.end) &&
                        index <= Math.max(selection.start, selection.end);

                        return (
                          <td
                            key={index}
                            colSpan={cellWidth(block, index, cell.span)}
                            onMouseDown={(event) => startSelect(event, block.id, row.id, index)}
                            onMouseEnter={() => extendSelect(block.id, row.id, index)}
                            onContextMenu={(event) => openMenu(event, block.id, row.id, index)}
                            onTouchStart={(event) => startLongPress(event, block.id, row.id, index)}
                            onTouchEnd={cancelLongPress}
                            onTouchMove={cancelLongPress}
                            className={`select-none border border-white px-1 py-1 ${
                            isView ? 'bg-[#fbdede]' : 'bg-[#d9f0dc]'} ${
                            editable ? 'cursor-cell' : ''} ${
                            inSelection ?
                            'bg-[#ffe9cf]/90 outline outline-2 -outline-offset-2 outline-[#f5921f]' :
                            ''}`
                            }>

                            {editable ?
                            <input
                              value={cell.value}
                              onChange={(event) =>
                              updateBlock(block.id, (current) => ({
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
                      {filler > 0 &&
                      <td
                        colSpan={filler}
                        className={isView ? 'border border-white bg-[#fbdede]' : 'border border-white bg-[#d9f0dc]'} />

                      }
                      <th className="sticky right-0 z-10 border border-white bg-[#1e7b45] px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-white">
                        {row.label}
                      </th>
                    </tr>);

                })}

                {/* Các tầng */}
                {block.floors.map((floor, floorIndex) => {
                  const picked =
                  selection?.kind === 'floor' &&
                  selection.blockId === block.id &&
                  selection.index === floorIndex;

                  return (
                    <tr key={`${floor}-${floorIndex}`}>
                      <th
                        onClick={() =>
                        editable &&
                        setSelection({ kind: 'floor', blockId: block.id, index: floorIndex })
                        }
                        className={`sticky left-0 z-10 border border-white px-2 py-1 ${
                        editable ? 'cursor-pointer' : ''} ${
                        picked ? 'bg-[#f5921f]' : 'bg-[#b8e6c4]'}`
                        }>

                        <div className="flex items-center justify-center gap-0.5">
                          {editable ?
                          <input
                            value={floor}
                            onChange={(event) =>
                            updateBlock(block.id, (current) =>
                            renameFloor(current, floorIndex, event.target.value)
                            )
                            }
                            className={`w-10 bg-transparent text-center text-[11.5px] font-bold outline-none ${
                            picked ? 'text-white' : 'text-[#14532d]'}`
                            } /> :


                          <span className="text-[11.5px] font-bold text-[#14532d]">{floor}</span>
                          }
                          {editable && picked && block.floors.length > 1 &&
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateBlock(block.id, (current) => removeFloor(current, floorIndex));
                              setSelection(null);
                            }}
                            className="text-white/80 transition-colors hover:text-white"
                            title={`Xóa tầng ${floor}`}>

                              <Trash2Icon className="h-3 w-3" />
                            </button>
                          }
                        </div>
                      </th>

                      {groupColumns(block).map((group) => {
                        const column = block.columns[group.start];
                        if (group.disabled) {
                          return (
                            <td
                              key={column.id}
                              colSpan={group.width}
                              className="border border-[#cfe3d4] bg-[#e5e7eb]" />);


                        }

                        const unit = column.mergedCodes.
                        map((code) => unitAt(floor, code)).
                        find(Boolean);
                        const show = unit && isVisible(unit);
                        const style = unit ? STATUS_STYLES[unit.status] : null;

                        return (
                          <td key={column.id} colSpan={group.width} className="border border-[#cfe3d4] p-0.5">
                            {show && unit && style &&
                            <button
                              type="button"
                              onClick={() => onSelectUnit(unit)}
                              className="flex h-full min-h-[28px] w-full items-center justify-center rounded-sm px-1 transition-opacity hover:opacity-80"
                              style={{ backgroundColor: style.background, color: style.color }}
                              title={`${unit.code} · ${unit.status}`}>

                                <span className="text-[11px] font-bold leading-tight">
                                  {renderPrice(unit)}
                                </span>
                              </button>
                            }
                          </td>);

                      })}
                      {filler > 0 && <td colSpan={filler} className="border border-[#cfe3d4] bg-[#f7fbf8]" />}
                      <th className="sticky right-0 z-10 border border-white bg-[#b8e6c4] px-2 py-1 text-[11.5px] font-bold text-[#14532d]">
                        {floor}
                      </th>
                    </tr>);

                })}

                {/* Vạch ngăn giữa hai khối */}
                {blockIndex < model.blocks.length - 1 &&
                <tr>
                    <td colSpan={maxColumns + 2} className="h-1.5 bg-[#1e7b45]/25 p-0" />
                  </tr>
                }
              </tbody>);

          })}
        </table>
      </div>

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

        </div>
      }

      {confirmDelete &&
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
          <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">

            <div className="px-5 py-4">
              <h3 className="text-base font-bold text-[#3b2c1d]">Xóa khối này?</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-stone-600">
                Hành động này sẽ xóa tất cả dữ liệu căn hộ trong khối này.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#eee4d5] px-5 py-3.5">
              <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="rounded-lg border border-[#e0d2bd] px-3 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef]">

                Hủy
              </button>
              <button
              type="button"
              onClick={doRemoveBlock}
              className="rounded-lg bg-[#c0392b] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#a03024]">

                Xóa khối
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}

/* ═══════════════════════════════════════════════════════════════
   Thanh công cụ
   ═══════════════════════════════════════════════════════════════ */

function ToolButton({
  icon,
  label,
  enabled,
  danger,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[12px] font-semibold transition-all ${
      enabled ?
      danger ?
      'bg-white text-[#c0392b] shadow-sm ring-1 ring-[#e8c4bf] hover:bg-[#fbedeb]' :
      'bg-white text-[#4a3728] shadow-sm ring-1 ring-[#e0d2bd] hover:bg-[#f7f2ea]' :
      'cursor-not-allowed text-[#c4b7a6]'}`
      }>

      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      {label}
    </button>);

}

/** Nhắc người dùng đang chọn gì — giải thích vì sao nút nào sáng. */
function describeSelection(selection: Selection | null): string {
  if (!selection) return 'Chọn ô tiêu đề, số tầng hoặc số căn để dùng công cụ';
  if (selection.kind === 'header') {
    const count = Math.abs(selection.end - selection.start) + 1;
    return count > 1 ? `Đang chọn ${count} ô tiêu đề` : 'Đang chọn 1 ô tiêu đề';
  }
  if (selection.kind === 'column') {
    const count = Math.abs(selection.end - selection.start) + 1;
    return count > 1 ? `Đang chọn ${count} trục căn` : 'Đang chọn một trục căn';
  }
  if (selection.kind === 'floor') return 'Đang chọn một tầng';
  return 'Đang chọn cả khối';
}

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
      {hint && <kbd className="shrink-0 font-mono text-[10px] text-stone-400">{hint}</kbd>}
    </button>);

}


/* ═══════════════════════════════════════════════════════════════
   Gom trục để render
   ═══════════════════════════════════════════════════════════════ */

interface ColumnGroup {
  start: number;
  end: number;
  /** Số ô vật lý nhóm chiếm. */
  width: number;
  disabled: boolean;
}

/**
 * Trục thường mỗi trục một nhóm; các trục khu vực chung liền nhau gom thành
 * một nhóm để hiển thị thành một ô ghi duy nhất.
 */
function groupColumns(block: GridBlock): ColumnGroup[] {
  const groups: ColumnGroup[] = [];
  let index = 0;

  while (index < block.columns.length) {
    const column = block.columns[index];

    if (!column.disabled) {
      groups.push({ start: index, end: index, width: column.span, disabled: false });
      index += 1;
      continue;
    }

    let end = index;
    let width = 0;
    while (end < block.columns.length && block.columns[end].disabled) {
      width += block.columns[end].span;
      end += 1;
    }
    groups.push({ start: index, end: end - 1, width, disabled: true });
    index = end;
  }

  return groups;
}
