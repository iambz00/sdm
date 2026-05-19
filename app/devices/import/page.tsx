"use client";

import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button"
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

export default function Tabeller() {
  const [data, setData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [merges, setMerges] = useState<XLSX.Range[]>([]);

  // 병합 정보를 바탕으로 셀의 span과 노출 여부를 결정하는 헬퍼 함수
  const getCellSpanInfo = (r: number, c: number) => {
    const merge = merges.find(m => r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c);
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
  };

  /* Load sample data once */
  useEffect(() => {
    /* Starting CSV data -- change data here */
    const csv = `\
This,is,a,Test
வணக்கம்,สวัสดี,你好,가지마
1,2,3,4`;

    /* Parse CSV into a workbook object */
    const wb = XLSX.read(csv, { type: "string" });
    const ws = wb.Sheets.Sheet1;

    /* Convert to JSON (2D Array) */
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    if (jsonData.length > 0) {
      setHeaders(jsonData[0]);
      setData(jsonData.slice(1));
      setMerges(ws['!merges'] || []);
    }
  }, []);

  return ( <>
    {/* Import Button */}
    <Input type="file" className="w-1/2" 
      onChange={async(e) => {
        if (!e.target.files) return;

        /* get data as an ArrayBuffer */
        const file = e.target.files[0];
        const data = await file.arrayBuffer();

        /* parse and load first worksheet */
        const wb = XLSX.read(data);
        const ws = wb.Sheets[wb.SheetNames[0]];
        
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        if (jsonData.length > 0) {
          setHeaders(jsonData[0]);
          setData(jsonData.slice(1));
          setMerges(ws['!merges'] || []);
        }
      }}
    />

    {/* Export Button */}
    <Button onClick={() => {
      /* Create workbook from state data */
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws['!merges'] = merges; // 내보낼 때도 병합 정보 유지
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      /* Export to file (start a download) */
      XLSX.writeFile(wb, "SheetJSIntro.xlsx");
    }}><b>Export XLSX!</b></Button>

    {/* Show shadcn/ui Table preview */}
    <div className="rounded-md border mt-4">
      <Table className="border-collapse [&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0 [&_th]:text-center">
        <TableHeader>
          <TableRow>
            {headers.map((header, i) => {
              const { rowSpan, colSpan, isHidden } = getCellSpanInfo(0, i);
              if (isHidden) return null;
              return (
                <TableHead key={i} rowSpan={rowSpan} colSpan={colSpan}>
                  {header}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => {
                const { rowSpan, colSpan, isHidden } = getCellSpanInfo(i + 1, j);
                if (isHidden) return null;
                return (
                  <TableCell key={j} rowSpan={rowSpan} colSpan={colSpan}>
                    {cell}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </> );
}