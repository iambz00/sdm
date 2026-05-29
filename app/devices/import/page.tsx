"use client";

import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


/* load the codepage support library for extended support with older formats  */
// import { set_cptable } from "xlsx";
// import * as cptable from 'xlsx/dist/cpexcel.full.mjs';
// set_cptable(cptable);

export default function DeviceImportBody() {
  const [workBook, setWorkBook] = useState<XLSX.WorkBook>();
  const [data, setData] = useState<any[][]>([]);
  const [merges, setMerges] = useState<XLSX.Range[]>([]);

  const [currentSheet, setCurrentSheet] = useState<string>();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function fileHandler(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    /* get data as an ArrayBuffer */
    const file = e.target.files[0];
    if (!file) return;
    setWorkBook(undefined);
    setData([]);
    setMerges([]);
    setCurrentSheet(undefined);

    const fileData = await file.arrayBuffer();

    const wb = XLSX.read(fileData, { dense: true, cellDates: true });
    setWorkBook(wb);

    setSelected(Object.fromEntries(wb.SheetNames.map((sheetName) => [sheetName, false])));
  }

  function sheetHandler(e: React.MouseEvent<HTMLButtonElement>) {
    const sheetName = e.currentTarget.textContent
    if (!workBook || !sheetName) return;

    if (e.ctrlKey) {
      setSelected(prevSelected => ({
        ...prevSelected,
        [sheetName]: !prevSelected[sheetName]
      }));
    }
    else if (e.shiftKey && currentSheet) {
      var [start, end] = [workBook.SheetNames.indexOf(currentSheet), workBook.SheetNames.indexOf(sheetName as string)]
      if (start > end) [start, end] = [end, start]
      setSelected(Object.fromEntries(workBook.SheetNames.map((sheetName, idx) => [sheetName, (start <= idx && idx <= end)])));
    }
    else {
      const ws = workBook.Sheets[sheetName];
      if (!ws) return;
      setCurrentSheet(sheetName);
      /* Convert to JSON (2D Array) */
      const jsonData = XLSX.utils.sheet_to_json(ws, { 
        header: 1, 
        defval: null,     // 빈 셀을 null로 채워 sparse array 방지
      }) as any[][];

      if (jsonData.length > 0) {
        const lastValidIndex = jsonData.reduceRight((found, curr, idx) => (found==-1 && curr.length > 0)? idx : found, -1)
        setData(jsonData.slice(0, lastValidIndex+1));
        setMerges(ws['!merges'] || []);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <div className="bg-primary/5 p-1">
        <div className="flex items-center">
          <Input type="file" className="min-w-1/3 max-w-3xs bg-background" 
            onChange={fileHandler}
          />
          <div className="flex-1 text-xs text-right">
            여기에 버튼 배치 - 범위 선택 / 가져오기
          </div>
        </div>
        <div className="py-1">
          <span className="text-primary text-sm font-bold">가져올 시트 선택</span>
          <span className="text-xs">(Shift-클릭: 범위 선택, Ctrl-클릭: 개별 선택, 클릭: 시트 내용 확인)</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {workBook?.SheetNames.map((sheetName, idx) => 
            <Button
              key={sheetName} 
              onClick={sheetHandler}
              variant={`${sheetName == currentSheet ? "default" : "outline"}`}
              className={`h-6 
                ${selected[sheetName] ? "border-dotted border-destructive" : ""}
              `}
            >
              {sheetName}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Tabler data={data} merges={merges}/>
      </div>
    </div>
  )
}

export function Tabler({
  data,
  merges
}:{
  data: any[][],
  merges?: XLSX.Range[]
}) {
  // 병합 정보를 바탕으로 셀의 span과 노출 여부를 결정하는 헬퍼 함수
  const getCellSpanInfo = (r: number, c: number) => {
    const merge = merges?.find(m => r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c);
    if (!merge) return { rowSpan: 1, colSpan: 1, isHidden: false };

    // 병합의 시작 셀(왼쪽 상단)인 경우 span 계산
    if (r === merge.s.r && c === merge.s.c) {
      return {
        rowSpan: merge.e.r - merge.s.r + 1,
        colSpan: merge.e.c - merge.s.c + 1,
        isHidden: false
      };
    }
    // 병합 범위 내에 있지만 시작 셀이 아닌 경우 렌더링하지 않음
    return { rowSpan: 1, colSpan: 1, isHidden: true };
  }
  function toXLCol(col: number) {
    let columnName = "";
    while (col >= 0) {
      columnName = String.fromCharCode((col % 26) + 65) + columnName;
      col = Math.floor(col / 26) - 1;
    }
    return columnName;
  }

  // 전체 데이터 중 가장 긴 행의 길이를 계산하여 전체 컬럼 수를 구함
  const maxCols = data.reduce((maxLength, row) => Math.max(maxLength, row.length), 0);

  return (
    <Table className="border-separate border-spacing-0 border-b border-r [&_th]:border-l [&_th]:border-t [&_td]:border-l [&_td]:border-t">
      <TableHeader>
        <TableRow>
          <TableHead className="sticky z-20 top-0 left-0 border-r border-b">
          </TableHead>
          {Array.from({ length: maxCols }).map((_, j) => (
            <TableHead key={j} className="sticky z-10 top-0 text-center font-bold text-xs bg-muted border-b">
              {toXLCol(j)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            <TableHead className="sticky z-10 left-0 border-r text-center font-bold text-xs bg-muted">
              {i + 1}
            </TableHead>
            {row.map((cell, j) => {
              const { rowSpan, colSpan, isHidden } = getCellSpanInfo(i, j);
              if (isHidden) return null;
              return (
                <TableCell key={j} rowSpan={rowSpan} colSpan={colSpan} className="whitespace-pre text-xs">
                  {cell instanceof Date ? cell.toLocaleDateString() : cell}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
